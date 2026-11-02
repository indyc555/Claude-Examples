/* Taxonomy sourced from "AI Taxonomy-v2.xlsx" (Taxonomy sheet).
   Supervisors = Product Lines · Workers = Persona · Skill · Agent · Task
   Obvious typos in the source were tidied; "…", "N/A" and blank cells were dropped. */
const T = (...t) => t;
const A = (name, ...tasks) => ({ name, tasks });
const K = (name, ...agents) => ({ name, agents });

function sourcing(variant) {
  const full = variant === 'Strategic Sourcing' || variant === 'Direct Materials';
  const tail = variant === 'Tail Spend';
  const complex = variant === 'Complex Sourcing';
  return [
    K('Sourcing Category Profile', A('Sourcing Event Trigger')),
    K('Sourcing Strategy Development', ...(tail ? [] : [A('Sourcing Strategy Recommendation')])),
    K('Sourcing Supplier Selection and Analysis', A('Supplier Discovery'), A('Sourcing Supplier Recommendation'), A('Sourcing Should-cost and Price')),
    K('Sourcing Run and Manage RFx', A('Sourcing Event Creation', 'Create Event', 'Invite Suppliers'), A('Sourcing Event Monitoring')),
    K('Sourcing Evaluate and Negotiate', ...(complex ? [] : [A('Sourcing Bids Review'), A('Sourcing Negotiation')])),
    K('Sourcing Final Analysis and Award',
      ...(full ? [A('Sourcing Scenario Optimization')] : []),
      ...(complex ? [] : [A('Sourcing Analysis Summary'), A('Sourcing Award Recommendation')]),
      ...(complex ? [A('Sourcing Analysis Summary'), A('Sourcing Award Recommendation')] : []),
      ...(full || tail ? [A('Sourcing Event Award')] : [])),
    K('Sourcing Implement and Contract', ...(complex ? [] : [A('Sourcing-based Contract Creation'), A('Sourcing-based PR Creation')])),
    K('Sourcing Measure and Report', ...(tail ? [] : [A('Sourcing Reports and Savings')]))
  ];
}

const DATA = [
  { name: 'Supplier Management', stage: 'Upstream', workers: [
    { name: 'JAI Supplier Manager', ui: 'supplier', lic: 'base', desc: 'Runs the full supplier lifecycle — from discovery and onboarding to risk monitoring, development and offboarding.',
      skills: [
        K('Supplier Discovery and Invitation', A('Supplier Discovery'), A('Supplier Invitation'), A('Supplier Deduplication')),
        K('Supplier Onboarding and Registration', A('Supplier Onboarding'), A('Supplier Data Enrichment'), A('Supplier Documents and Certificates')),
        { ...K('Supplier Data Validation', A('Supplier Bank and VAT Validation')), lic: 'usage', release: '26.3 (EA)' },
        K('Supplier Qualification and Assessment', A('Supplier Qualification')),
        K('Supplier Segmentation and Planning', A('Supplier Segmentation and Strategy')),
        K('Supplier Data Maintenance', A('Supplier Data Enrichment')),
        K('Supplier Risk and Compliance Monitoring', A('Supplier Risk Monitoring'), A('Supplier Risk Response')),
        K('Supplier Evaluation and Development', A('Supplier Performance Evaluation'), A('Supplier Development')),
        K('Supplier Renewal and Offboarding', A('Supplier Renewal'), A('Supplier Offboarding'))
      ] }
  ] },
  { name: 'Source to Contract', stage: 'Upstream', workers: [
    { name: 'JAI Category Management', ui: 'category', lic: 'base', desc: 'Builds, reviews and executes category strategies using supplier and market insight.',
      skills: [
        K('Category Management Strategy Development', A('Category Strategy Definition'), A('Category Supplier Evaluation'), A('Category Market Insights Evaluation'), A('Category Strategy Implementation')),
        K('Category Management Strategy Review', A('Category Strategy Update'), A('Category Strategy Review and Assessment'))
      ] },
    { name: 'JAI Sourcing Manager (Tail Spend)', ui: 'sourcing', lic: 'usage', desc: 'Automates low-value, high-volume sourcing events end to end.', skills: sourcing('Tail Spend') },
    { name: 'JAI Sourcing Manager (Strategic Sourcing)', ui: 'sourcing', lic: 'usage', desc: 'Runs strategic RFx events with scenario optimization and award recommendations.', skills: sourcing('Strategic Sourcing'), note: 'Includes ASO' },
    { name: 'JAI Sourcing Manager (Complex Sourcing)', ui: 'sourcing', lic: 'usage', desc: 'Handles multi-lot, multi-criteria sourcing with Advanced Sourcing Optimization.', skills: sourcing('Complex Sourcing'), note: 'ASO Sourcing' },
    { name: 'JAI Sourcing Manager (Direct Materials)', ui: 'sourcing', lic: 'usage', desc: 'Sourcing for direct materials with should-cost and scenario optimization.', skills: sourcing('Direct Materials'), note: 'JD Sourcing' },
    { name: 'JAI Contract Manager', ui: 'contract', lic: 'base', desc: 'Takes a contract from intake and drafting through review, approval, monitoring and renewal.',
      skills: [
        K('Contract Request and Intake', A('Contract Metadata Extraction at Intake'), A('Contract Intake Triage'), A('Contract Expanded Metadata Extraction')),
        K('Contract Existence Check', A('Contract Repository Chat'), A('Contract Linked and Duplicate Detection')),
        K('Contract Authoring and Drafting', A('Contract Alternative Language Suggestions'), A('Contract Automated Creation')),
        K('Contract Review and Negotiation', A('Chat With Your Contract'), A('Contract Risky Language Review'), A('Contract Compliance'), A('Contract Compliance on Supplier Paper'), A('Contract Redline Change Summary'), A('Contract Negotiation Insights')),
        K('Contract Approval', A('Contract Document Workflow Validation'), A('Contract Approver Routing of Findings')),
        K('Contract Execution and Storage', A('Contract AI Summarization')),
        K('Contract Management and Monitoring', A('Contract Obligation Monitoring')),
        K('Contract Renewal and Amendment', A('Contract Consolidated View'), A('Contract Renewal Recommendation'), A('Contract Comparison'))
      ] }
  ] },
  { name: 'Procure to Pay', stage: 'Downstream', workers: [
    { name: 'JAI Intake Manager (End-user)', ui: 'intake', lic: 'base', desc: 'Guided Buying for end-users — understands what you need and routes it to catalog, contract, punch-out or a guided request.', note: 'Guided Buying',
      skills: [
        K('Research Material', A('Catalog', 'Hosted', 'Punch-out'), A('Contract-Based'), A('Non-Catalog')),
        K('Indirect Materials Buyer', A('Catalog', 'Hosted', 'Punch-out'), A('Contract-Based'), A('Non-Catalog'))
      ] },
    { name: 'Buyer', ui: 'buyer', lic: 'base', desc: 'Creates and routes purchase requisitions for direct materials and services.',
      skills: [K('Direct Material Buyer'), K('Services'), K('Create Purchase Requisition'), K('Approvals')] },
    { name: 'Buying (Purchaser)', ui: 'purchaser', lic: 'base', desc: 'Accepts approved requisitions and turns them into purchase orders.',
      skills: [K('Accept PR'), K('Create Purchase Order')] },
    { name: 'JAI Invoicing (A/P)', ui: 'invoice', lic: 'base', desc: 'Captures, enriches, matches and approves invoices — and flags exceptions and fraud.',
      skills: [
        K('Invoice Receiving', A('Invoice from Legal Entities and Governments'), A('Invoice in EDI Format'), A('Invoice via API'), A('Invoice ERS (Self-billing)'), A('Paper Invoice'), A('Invoice from Logistic Providers (3PL)'), A('Invoice Summary in Excel'), A('Invoice Receiving Exceptions')),
        K('Invoice Capture', A('Paper Invoice Scanning'), A('Invoice PDF/Image OCR'), A('Invoice Capture Exceptions')),
        K('Invoice Enrichment', A('Invoice Buyer Company Determination'), A('Invoice Company Code'), A('Invoice Supplier Company Determination'), A('Invoice Cost Objects Determination'), A('Invoice Enrichment Exceptions')),
        K('Invoice References at Header and Line-Items', A('Invoice PO/SOW/Contract References Determination'), A('Invoice GR/SES References Determination'), A('Invoice Scheduled Lines Determination'), A('Invoice Missing References Exceptions')),
        K('Invoice Matching', A('Invoice Duplicate Check'), A('Invoice 2-way Match'), A('Invoice 3-way Match'), A('Invoice 4-way Match'), A('Invoice Matching Exceptions')),
        K('Invoice Tax Calculation and Validations', A('Invoice Tax Calculation'), A('Invoice Tax Calculation by External Providers'), A('Invoice Tax Validation against Government'), A('Invoice Tax Calculation Exceptions')),
        K('Invoice Validations', A('Invoice Business Rules Exceptions'), A('Invoice Processing Exceptions'), A('Invoice Exceptions Handling'), A('Invoice Fraud Prevention'), A('Invoice Fraud Detection')),
        K('Invoice Approval', A('Invoice A/P Approvals Workflow'), A('Invoice Business Approvals Workflow'), A('Invoice Approval Workflow Exceptions'), A('Invoice Dispute Management with Supplier')),
        K('Invoice OK2Pay', A('Invoice Virtual Card Integration'), A('Invoice Payment Schedule Definition'), A('Invoice Finance Posting Definition'), A('Invoice Posting Integration')),
        K('Invoice Analytics and Compliance', A('Invoice A/P KPIs'), A('Invoice Analytics and Reports'), A('Invoice Audit Logs and Reports'), A('Invoice Legal Archiving Compliance'))
      ] },
    { name: 'JAI Pay (Treasury/Finance)', ui: 'pay', lic: 'base', desc: 'Prepares, optimizes and executes payment runs, including supply chain finance.',
      skills: [K('Payments', A('Payment Eligible Invoices Selection'), A('Supply Chain Finance for Suppliers'), A('Payment Finance'), A('Payment Run Preparation (weekly/monthly)'), A('Payment Optimization'), A('Payment Run (weekly/monthly)'), A('Payment Run Exceptions'))] }
  ] },
  { name: 'Spend Analytics', stage: 'All functions', workers: [
    { name: 'JAI Spend Analysis (Procurement Analyst)', ui: 'spend', lic: 'base', desc: 'Analyzes and benchmarks spend across every procurement function.',
      skills: [K('Spend Analysis and Benchmarking',
        ...['Category Management', 'Supplier Management', 'Sourcing', 'Contracts', 'Procurement', 'Invoicing', 'Payments', 'ERP', 'Intake', 'Network'].map(x => A('Spend Analysis and Benchmarking for ' + x)))] }
  ] },
  { name: 'Platform', stage: 'All functions', workers: [
    { name: 'Admin', ui: 'platform', lic: 'base', desc: 'Configures AI Workers, guardrails, permissions and the Trust Center.', skills: [K('Worker Configuration'), K('Access and Guardrails')] },
    { name: 'Integration', ui: 'platform', lic: 'base', desc: 'Connects AI Workers to ERP, MS Teams and other enterprise systems.', skills: [K('System Connectors'), K('MS Teams')] }
  ] }
];
