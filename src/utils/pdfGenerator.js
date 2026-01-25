import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates a professional PDF report for a cloud project.
 * @param {Object} project - The workspace/project data
 * @param {string} diagramImage - Base64 data URL of the architecture diagram (optional)
 */
export const generateProjectReport = async (project, diagramImage) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;

    // Colors
    const primaryColor = [66, 133, 244]; // Blue #4285F4
    const secondaryColor = [80, 80, 80]; // Dark Gray

    // Helper: Header
    const addHeader = () => {
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("Cloud Infrastructure Report", margin, 25);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth - margin - 60, 25);
    };

    addHeader();

    let yPos = 55;

    // 1. Project Overview
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Project Overview", margin, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(`Project Name: ${project.name || 'Untitled Project'}`, margin, yPos);
    yPos += 7;

    doc.setFont("helvetica", "normal");
    const description = project.description || "No description provided for this project.";
    const descLines = doc.splitTextToSize(description, pageWidth - (margin * 2));
    doc.text(descLines, margin, yPos);
    yPos += (descLines.length * 6) + 10;

    // Project Meta Data Table
    // Project Meta Data Table
    // Safe accessors with fallback exploration
    const infraSpec = project.infraSpec || project.state_json?.infraSpec || {};
    const costData = project.costEstimation || project.state_json?.costEstimation || {};

    // Provider
    const provider =
        project.state_json?.selectedProvider ||
        infraSpec.provider ||
        infraSpec.resolved_region?.provider ||
        costData.recommended?.provider ||
        'Not Selected';

    // Region
    const region =
        infraSpec.resolved_region?.resolved ||
        infraSpec.resolved_region?.logical ||
        infraSpec.region ||
        'Auto-detected';

    // Environment
    const environment =
        infraSpec.environment ||
        project.state_json?.env_type ||
        'Production';

    // Cost Profile (Scenario)
    const rawProfile = project.state_json?.costProfile || costData.profile || 'Standard';
    const costProfile = rawProfile.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    // Cost Details
    let estimatedCost = 'Calculated on Deployment';
    if (costData.rankings) {
        // Try to find cost for selected provider
        const providerCost = costData.rankings.find(r => r.provider?.toLowerCase() === provider.toLowerCase());
        if (providerCost) estimatedCost = providerCost.formatted_cost;
    }
    if (estimatedCost === 'Calculated on Deployment' && costData.recommended) {
        estimatedCost = costData.recommended.formatted_cost;
    }
    if (estimatedCost === 'Calculated on Deployment' && costData.totalMonthlyCost) {
        estimatedCost = costData.totalMonthlyCost;
    }

    const metaData = [
        ['Cloud Provider', provider.toUpperCase()],
        ['Target Region', region],
        ['Environment Type', environment],
        ['Optimization Profile', costProfile.replace(/_/g, ' ')]
    ];

    autoTable(doc, {
        startY: yPos,
        head: [['Attribute', 'Value']],
        body: metaData,
        theme: 'striped',
        headStyles: { fillColor: primaryColor },
        styles: { fontSize: 10 },
        margin: { left: margin, right: margin }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // 2. Cost Analysis
    doc.setFontSize(16);
    doc.setTextColor(...secondaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("Cost Analysis", margin, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(`Estimated Monthly Cost: ${estimatedCost}`, margin, yPos);
    yPos += 15;


    // 3. Architecture Diagram
    if (yPos + 80 > pageHeight) { // check for space
        doc.addPage();
        addHeader();
        yPos = 55;
    }

    doc.setFontSize(16);
    doc.setTextColor(...secondaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("Architecture Diagram", margin, yPos);
    yPos += 10;

    if (diagramImage) {
        console.log('[PDF] Rendering diagram image...');
        try {
            const imgProps = doc.getImageProperties(diagramImage);
            console.log('[PDF] Image properties:', imgProps.width, 'x', imgProps.height);
            let pdfWidth = pageWidth - (margin * 2);
            let pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            // 🔥 Scale down if height exceeds page capacity
            const maxPageHeight = pageHeight - 60; // Leave room for margins
            if (pdfHeight > maxPageHeight) {
                pdfHeight = maxPageHeight;
                pdfWidth = (imgProps.width * pdfHeight) / imgProps.height;
            }

            // Check if image fits on current page, else new page
            if (yPos + pdfHeight > pageHeight - 20) {
                doc.addPage();
                addHeader();
                yPos = 55;
            }

            // Center horizontally if scaled down by height
            const xPos = margin + (pageWidth - (margin * 2) - pdfWidth) / 2;

            doc.addImage(diagramImage, 'PNG', xPos, yPos, pdfWidth, pdfHeight);
            yPos += pdfHeight + 15;
        } catch (e) {
            console.error("PDF Diagram Error:", e);
            doc.setFontSize(10);
            doc.setTextColor(255, 0, 0);
            doc.text("[Diagram Image Corrupted or Invalid Format]", margin, yPos);
            yPos += 10;
        }
    } else {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "italic");
        doc.text("[Architecture Diagram not captured yet. Please view the Architecture step to update.]", margin, yPos);
        yPos += 15;
    }

    // 4. Infrastructure Services
    if (yPos + 40 > pageHeight) {
        doc.addPage();
        addHeader();
        yPos = 55;
    }

    doc.setFontSize(16);
    doc.setTextColor(...secondaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("Provisioned Services", margin, yPos);
    yPos += 10;

    // Try to get services from multiple potential sources in state
    const services = project.infraSpec?.services_contract?.services
        || project.infraSpec?.canonical_architecture?.deployable_services
        || project.state_json?.services
        || [];

    if (services.length > 0) {
        const serviceRows = services.map(s => {
            const serviceName = s.display_name || s.name || s.cloud_service || s.type || 'Unknown Service';
            const serviceCategory = s.category || s.service_type || s.service_class || 'General';
            const serviceTier = s.tier || s.size || 'Standard';
            return [serviceName, serviceCategory, serviceTier];
        });

        autoTable(doc, {
            startY: yPos,
            head: [['Service Name', 'Category', 'Configuration']],
            body: serviceRows,
            theme: 'grid',
            headStyles: { fillColor: [40, 40, 40] },
            margin: { left: margin, right: margin }
        });
    } else {
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text("No specific service contract details available in this report version.", margin, yPos);
    }

    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    // Save
    doc.save(`${(project.name || 'Project').replace(/[^a-zA-Z0-9]/g, '_')}_Report.pdf`);
};
