# 0020. Sample FAQ content

Transcribed on 2026-11-23 from the engineer's document (seven page images). This is placeholder content; the client will rewrite it. `/develop` copies it into `src/content/faqRegions/en/<slug>.yaml` word for word, dropping the `Q1:` and `A:` prefixes and the document's italics (Zenekon, Ho-Ren-So, Kenchikushi, Fudosan). Bold phrases are already written as `**bold**`. The `id` of each question is a proposal; it becomes the question's anchor.

The document's opening paragraph ("Unlike architecture firms... Realty/Land Developers and City Planners buy BIM to de-risk capital, accelerate municipal approvals, prevent costly field change orders, and enable long-term asset/urban management (Digital Twins & GIS).") stays off the site, by the engineer's choice.

## 1. United States

- slug: `united-states` · code: `US` · order: 1
- focus: ROI, Speed-to-Market, AIA/BIMForum Standards, AHJ Permitting, & Legal Risk.

1. `imperial-units-and-lod`
   - Q: How do you ensure models comply with US Imperial units, AIA BIM protocols, and BIMForum LOD specifications?
   - A: Every US project is initialized using native Imperial Revit templates configured to the latest BIMForum LOD (100–500) specification and your project's BIM Execution Plan (BEP). Our QA/QC team runs automated Model Checker audits before every milestone to guarantee zero metric/imperial conversion errors.
2. `gis-and-civil-3d`
   - Q: Can your Landscape and Site BIM models integrate with Esri ArcGIS and Civil 3D for masterplanning and city zoning reviews?
   - A: Yes. We maintain strict shared coordinate systems (State Plane / WGS84) so our Revit architectural/landscape models align seamlessly with Civil 3D surfaces and Esri ArcGIS/InfraWorks environments, enabling accurate zoning envelopes, setback checks, and municipal GIS integration.
3. `reduce-change-orders`
   - Q: How does outsourcing BIM reduce our hard construction costs and change orders?
   - A: By executing multi-discipline clash detection (Navisworks) and constructability reviews at LOD 350 before tender, we typically identify and resolve hundreds of spatial conflicts between architecture, interiors, landscape hardscape, and underground utilities—preventing expensive RFIs and field rework that erode developer margins.
4. `quantity-takeoffs-5d`
   - Q: Can your models support 5D BIM (Quantity Takeoffs & Cost Estimation) to validate contractor bids?
   - A: Absolutely. We model with strict Uniformat II / MasterFormat coding and clean element parameters so your pre-construction team or cost estimators can extract reliable, live Quantity Takeoffs (QTO) directly from Revit to benchmark GC bids.
5. `ip-nda-data-security`
   - Q: How do you handle US Intellectual Property (IP) protection, NDAs, and data security?
   - A: We sign US-jurisdiction mutual NDAs, operate strictly within your secure Autodesk Construction Cloud (ACC / BIM 360) environment so files never reside on unauthorized local drives, and enforce role-based access control across our studio.
6. `ada-and-ibc`
   - Q: Do your models account for US codes like ADA accessibility and IBC egress clearances?
   - A: While your US-licensed Architect of Record (AoR) retains legal stamping authority, our BIM specialists model to your redlines with active awareness of ADA clearances (turning radii, ramp slopes in landscape/interiors) and IBC spatial rules, flagging potential non-compliances early.
7. `time-difference`
   - Q: How does the 11-to-14-hour time difference with Vietnam actually benefit our development schedule?
   - A: It creates a 24-hour "follow-the-sun" production cycle. Your US team uploads markups or city review comments at 5:00 PM EST/PST, our team executes the revisions during your night, and updated models/sheets are ready in ACC when you log in at 8:00 AM.
8. `lod-500-cobie`
   - Q: Can you deliver LOD 500 As-Built models with COBie data for our property management and FM teams?
   - A: Yes. We update design models against contractor redlines and laser scans (Scan-to-BIM) to deliver clean LOD 500 digital twins populated with COBie asset attributes ready for upload into Archibus, Maximo, or Procore.
9. `hearings-and-pitch-decks`
   - Q: How do you support public hearings, HOA approvals, and investor pitch decks?
   - A: From the same single-source-of-truth BIM model, we produce accurate massing studies, shadow/solar analyses, sightline views, and real-time Enscape/Twinmotion walkthroughs so planners and developers can win stakeholder approval faster.
10. `pilot-project`
    - Q: Can we test your team's quality before committing to a multi-phase masterplan?
    - A: Yes. We recommend starting with a low-risk pilot—such as modeling one typical residential/hospitality unit or a defined landscape parcel—using your exact standards so your BIM Manager can audit our model hygiene firsthand.

## 2. Australia

- slug: `australia` · code: `AU` · order: 2
- focus: NATSPEC/ISO 19650, Council DA Approvals, QS/5D Integration, Digital Twins, & Time-Zone Overlap.

1. `iso-19650-natspec`
   - Q: Are your BIM workflows aligned with ISO 19650 and the NATSPEC National BIM Guide?
   - A: Yes. Our delivery workflows strictly follow ISO 19650 naming conventions, CDE (Common Data Environment) protocols, and NATSPEC guidelines, ensuring seamless handover across Australian Tier-1 contractors, consultants, and state government agencies.
2. `working-hours-overlap`
   - Q: How well do our working hours overlap for live coordination with Sydney, Melbourne, or Brisbane teams?
   - A: Vietnam (GMT+7) sits just 3 to 4 hours behind AEST/AEDT, giving us a **5-to-6-hour real-time overlap every business day**. Our BIM leads join your live Teams/Zoom coordination meetings and respond to urgent council RFI markups on the same day.
3. `state-digital-twins`
   - Q: Can your BIM models feed into Australian State Digital Twins (e.g., NSW Spatial Digital Twin or Digital Twin Victoria)?
   - A: Yes. We structure our georeferenced site, landscape, and architectural models for clean IFC and CityGML/3D Tiles export so urban planners and developers can plug proposed precincts directly into state-level spatial digital twins.
4. `development-applications`
   - Q: How do you support Development Application (DA) submissions for local councils?
   - A: We produce council-ready DA drawing sets, accurate overshadowing/solar access diagrams (critical for SEPP 65 / Apartment Design Guide compliance), GFA/FSR area schedules, and landscape deep-soil calculations directly from the Revit model.
5. `quantity-surveyors`
   - Q: Can your models be structured for Australian Quantity Surveyors (QS) using CostX or Cubit?
   - A: Yes. We build clean, non-overlapping geometry with standardized Australian classification codes (Uniclass 2015 / ANZRS) so your QS team can run automated 5D takeoffs in iTWO CostX without manual cleanup.
6. `green-star-nabers`
   - Q: How do you support Green Star and NABERS sustainability documentation?
   - A: We embed material thermal/glazing parameters, accurate room volumes, orientation data, and landscape permeability/canopy metrics into the BIM model, giving your ESD (Environmentally Sustainable Design) consultants reliable inputs for energy and Green Star modeling.
7. `btr-hospitality-masterplans`
   - Q: Do you have experience with high-density Build-to-Rent (BTR), hospitality, and masterplanned communities?
   - A: Yes. Our core specialization across Architectural, Interior (FF&E/joinery), and Landscape BIM makes us uniquely suited for mixed-use precincts, resorts, and BTR developments where interior repeatability and exterior amenity coordination drive ROI.
8. `council-revisions`
   - Q: How do you handle revisions when a local council requests design modifications mid-approval?
   - A: Because all plans, sections, schedules, and area tables are parametrically linked in our Revit models, council-mandated height, setback, or unit-mix changes propagate automatically across the entire documentation set—cutting turnaround times dramatically.
9. `qa-qc-process`
   - Q: What QA/QC process guarantees we won't waste internal senior staff hours fixing offshore models?
   - A: Every deliverable passes a 3-tier QA/QC gate: automated Revit/Solibri model health checks, discipline-lead coordination review, and a final BEP compliance sign-off before upload to ACC or Aconex.
10. `engagement-models`
    - Q: What commercial engagement models do you offer for long-term Australian property portfolios?
    - A: We offer both Fixed-Fee milestone pricing (ideal for defined DA/Tender packages) and Dedicated BIM Pods (monthly FTE teams embedded directly into your studio) to scale flexibly across your development pipeline.

## 3. European Union

- slug: `european-union` · code: `EU` · order: 3
- focus: GDPR & Data Sovereignty, OpenBIM (IFC 4.3), EU Taxonomy/ESG, & Public Procurement Mandates.

1. `gdpr-data-sovereignty`
   - Q: How do you guarantee strict GDPR compliance and EU data sovereignty when working offshore?
   - A: All project files remain hosted exclusively on your EU-region cloud servers (e.g., ACC Europe, Dalux, or BIMcollab). Our staff access data via encrypted, role-restricted sessions under EU Standard Contractual Clauses (SCCs) and strict NDAs, with zero unauthorized local data retention.
2. `openbim-ifc-bcf`
   - Q: Do you work strictly in OpenBIM (IFC 4.3 and BCF) rather than locking us into proprietary software?
   - A: Yes. While we author primarily in Revit, we are fully fluent in OpenBIM workflows—exporting validated IFC 2x3 / IFC 4.3 models with clean Property Sets (Psets) and managing issue tracking via BCF (BIM Collaboration Format) in Solibri, BIMcollab, or Dalux.
3. `iso-19650-information-management`
   - Q: Are your teams certified or fully experienced in ISO 19650-1, -2, and -3 information management?
   - A: Yes. We operate strictly within ISO 19650 CDE states (WIP → Shared → Published → Archived), adhering to your Exchange Information Requirements (EIR) and Master Information Delivery Plan (MIDP).
4. `taxonomy-epbd-carbon`
   - Q: How can your BIM models help us meet EU Taxonomy, EPBD, and Embodied Carbon (LCA) reporting requirements?
   - A: We enrich architectural, interior, and landscape elements with accurate material quantities, volume data, and structured classification codes (Uniclass, OmniClass, or DIN 276) so your sustainability engineers can run automated Life Cycle Assessments (LCA) and carbon accounting directly from the model.
5. `urban-digital-twins-citygml`
   - Q: Can you support Urban Digital Twins and CityGML workflows for European municipal planners?
   - A: Yes. Our Landscape and Architectural BIM teams deliver georeferenced 3D district models compatible with CityGML and GIS platforms, helping city planners visualize urban heat islands, green-space ratios, and infrastructure integration.
6. `national-standards`
   - Q: How do you handle country-specific European standards (e.g., German HOAI/DIN, French DTU, or Nordic BIM standards)?
   - A: During onboarding, we map your local national templates, drawing conventions, and phase deliverables (such as HOAI Leistungsphasen 1–5) into a project-specific QA checklist and execute a calibration sample before full-scale production.
7. `heritage-scan-to-bim`
   - Q: Can you handle adaptive reuse and heritage renovation projects using Scan-to-BIM?
   - A: Yes. Historic renovation is huge across Europe. We convert dense LiDAR point clouds into accurate, high-tolerance LOD 300–400 Revit models—capturing irregular facades, heritage interiors, and courtyards—so developers can plan retrofits without structural surprises.
8. `public-tenders`
   - Q: What is your experience with public tender BIM mandates across Europe?
   - A: We understand the strict compliance thresholds of EU public procurement. We deliver auditable, clash-free models, full revision histories, and structured asset data packages that pass rigorous third-party BIM audits.
9. `multilingual-teams`
   - Q: How do you manage communication and language across multilingual European project teams?
   - A: All project leads are fluent in English for technical coordination, and we can populate drawing sheets, schedules, and IFC parameters using your localized terminology glossaries (German, French, Dutch, Nordic languages, etc.).
10. `high-end-interiors`
    - Q: How do you ensure design quality isn't lost in high-end European hospitality or residential interiors?
    - A: Unlike generic MEP drafting shops, BIM Delivery has dedicated Interior and Landscape BIM specialists who understand millwork, FF&E tolerances, bespoke finishes, and material transitions—preserving the exact design intent of European architects and developers.

## 4. Canada

- slug: `canada` · code: `CA` · order: 4
- focus: Municipal Permitting, Metric/Imperial Fluency, Climate Resilience, Bilingual (EN/FR) Readiness, & Talent Shortages.

1. `metric-and-imperial`
   - Q: Can your team switch seamlessly between Metric (municipal/institutional) and Imperial (private residential/US-influenced) standards?
   - A: Yes. We recognize Canada's dual-unit reality. We configure project templates cleanly for either Metric (mm/m) or Imperial (ft/in) according to your municipality and developer standards, ensuring zero rounding or schedule discrepancies.
2. `buildingsmart-canada`
   - Q: Are your workflows aligned with buildingSMART Canada (IBC) and municipal guidelines like the City of Toronto or Vancouver BIM standards?
   - A: Yes. We align our BEPs, LOD progressions, and model structures with buildingSMART Canada best practices, ISO 19650, and municipal digital submission requirements.
3. `faster-approvals`
   - Q: How can your BIM services help accelerate slow Canadian municipal zoning and site plan approvals?
   - A: We produce highly accurate Site Plan Approval (SPA) packages, 3D massing studies, shadow impact models, and landscape grading/stormwater coordination models that answer municipal planner objections upfront—reducing review cycles.
4. `harsh-climates`
   - Q: How do you handle envelope and landscape modeling for harsh Canadian climates (snow loads, thermal bridging, freeze-thaw)?
   - A: We model detailed building envelope assemblies (curtain walls, insulation continuity, flashing) and site grading/drainage accurately to your consultant specifications, running clash detection to ensure structural/MEP penetrations don't compromise thermal or waterproofing integrity.
5. `bilingual-drawing-sets`
   - Q: Can you support bilingual (English/French) drawing sets for developments in Quebec or federal projects?
   - A: Yes. Using parametric shared parameters and bilingual Revit title blocks/schedules provided by your team, we maintain synchronized English/French annotation sets without duplicating model geometry.
6. `ipd-and-p3`
   - Q: How do you integrate with Integrated Project Delivery (IPD) and Public-Private Partnership (P3) workflows?
   - A: We work directly inside your shared cloud CDE (ACC/BIM 360), participating in regular Big Room coordination cycles and delivering rapid, transparent model updates that keep developers, GCs, and trade partners aligned.
7. `offshore-pod-savings`
   - Q: Canadian cities face severe BIM talent shortages and high local overhead—how much can we save with a dedicated offshore pod?
   - A: Developers and planning firms typically achieve **40%–60% cost savings** compared to hiring full-time in-house BIM technicians in Toronto, Vancouver, or Calgary, while gaining instant access to a 60+ specialist bench that scales up or down with project phases.
8. `podiums-and-rooftop-landscapes`
   - Q: Can you coordinate underground parking, podiums, and rooftop amenity landscapes in high-density transit-oriented developments (TOD)?
   - A: Yes. Podium-to-landscape coordination (soil depth over structural slabs, drainage, planters, and architectural skylights) is one of our strongest niches, preventing costly leaks and structural rework in high-density towers.
9. `pipeda-confidentiality`
   - Q: How do you handle Canadian privacy laws (PIPEDA) and developer confidentiality for unannounced land acquisitions?
   - A: We execute strict Canadian-compliant NDAs, isolate unannounced feasibility/massing projects in restricted cloud folders, and never disclose or showcase client projects without explicit written permission.
10. `scaling-up`
    - Q: What happens if our project scope suddenly doubles after a land rezoning win?
    - A: Because we maintain a multi-disciplinary team across Architecture, Interiors, and Landscape, we can onboard additional trained BIM modelers onto your standards within 5–7 business days—eliminating months of local recruiting delays.

## 5. Japan

- slug: `japan` · code: `JP` · order: 5
- focus: MLIT Standards, Project PLATEAU, Zero-Defect QA/QC (品質保証), Japanese Communication (BrSE), & Long-Term Trust.

1. `mlit-guidelines`
   - Q: Do you comply with Japan's MLIT BIM Guidelines (国土交通省BIMガイドライン) and Japanese Revit templates?
   - A: Yes. We are experienced with MLIT BIM guidelines, Japanese-standard Revit templates (such as Autodesk's Japan content library and BooT.one workflows), and JIS drawing/dimensioning conventions required by Japanese developers and general contractors (Zenekon).
2. `project-plateau`
   - Q: Can your urban and landscape BIM models integrate with MLIT's Project PLATEAU (3D City Models / CityGML)?
   - A: Yes. We align our masterplan, architectural, and landscape models with Japan's Plane Rectangular Coordinate System so they integrate smoothly with Project PLATEAU CityGML datasets for urban simulation, wind/sunlight studies, and municipal presentations.
3. `japanese-coordinators`
   - Q: Do you have Japanese-speaking Bridge SEs (BrSE) or Project Coordinators to prevent miscommunication?
   - A: Yes. We assign dedicated Japanese-speaking coordinators who understand both AEC technical terminology and Japanese business etiquette (Ho-Ren-So / 報連相), ensuring your specifications, nuances, and schedule expectations are translated with 100% accuracy to our production team.
4. `zero-defect-quality`
   - Q: How do you guarantee Japanese-level "Zero-Defect" quality (品質保証) in offshore BIM production?
   - A: We implement a rigorous, documented multi-stage inspection checklist (自主検査チェックシート) modeled on Japanese Zenekon standards. Every sheet, tag, line weight, and clash check is verified and signed off before submission, and we track defect rates transparently at every milestone.
5. `building-standards-act`
   - Q: Can your models support Japan's Building Standards Act (建築基準法) confirmation applications (確認申請) and sunlight regulation (日影規制) checks?
   - A: Yes. While final legal submission is handled by your registered Kenchikushi (建築士), we model precise floor areas, building heights, setback lines (斜線制限), and site topography so your compliance and sunlight-shadow verification software runs accurately without manual redrawing.
6. `isms-iso-27001`
   - Q: How do you protect confidential development plans and meet Japanese corporate security standards (ISMS / ISO 27001)?
   - A: We enforce strict information security protocols—including dedicated project environments, NDA/confidentiality pledges per engineer, zero USB/external transfer policies, and cloud-only CDE access—matching the security expectations of major Japanese real estate developers (Fudosan).
7. `design-refinements`
   - Q: How do you handle frequent, ultra-detailed design refinements during Basic Design (基本設計) and Working Drawings (実施設計)?
   - A: We maintain clean parametric family structures and structured revision logs so iterative refinements—whether in luxury hospitality joinery, façade louvers, or Japanese garden/landscape hardscaping—are reflected rapidly and consistently across all drawings.
8. `lcc-and-fm`
   - Q: Can your BIM models support Life Cycle Costing (LCC) and long-term Facility Management (FM) after handover?
   - A: Yes. Japanese developers prioritize long-term asset value and maintenance. We deliver structured LOD 500 As-Built models with standardized equipment/finish schedules ready for long-term building maintenance and lifecycle planning.
9. `why-vietnam`
   - Q: Why should a Japanese developer choose Vietnam over other offshore destinations for BIM?
   - A: Vietnam shares a **2-hour time difference** with Tokyo (allowing near-real-time collaboration), deep cultural alignment in craftsmanship and diligence, and a proven track record as Japan's #1 preferred offshore engineering partner.
10. `trial-project`
    - Q: We value long-term partnerships—how do we safely start a relationship with BIM Delivery?
    - A: We never rush a large contract. We propose starting with a small, clearly scoped **Trial Project (トライアル案件)**—such as one floor of an interior/architectural package or a landscape zone—so your team can evaluate our communication speed, Japanese drawing precision, and QA/QC rigor before building a long-term dedicated team.
