// Comprehensive list of real drug names with descriptions
// Curated to include drugs that could sound like Pokemon names

export const drugNames = [
  // Antidepressants & Mental Health
  { name: "Zoloft", category: "ANTIDEPRESSANT", description: "Treats depression, OCD, panic attacks, and PTSD.", color: "#9B59B6" },
  { name: "Prozac", category: "ANTIDEPRESSANT", description: "Treats depression, OCD, and bulimia nervosa.", color: "#3498DB" },
  { name: "Lexapro", category: "ANTIDEPRESSANT", description: "Treats depression and generalized anxiety disorder.", color: "#2ECC71" },
  { name: "Cymbalta", category: "ANTIDEPRESSANT", description: "Treats depression, anxiety, and chronic pain.", color: "#E74C3C" },
  { name: "Wellbutrin", category: "ANTIDEPRESSANT", description: "Treats depression and helps with smoking cessation.", color: "#F39C12" },
  { name: "Effexor", category: "ANTIDEPRESSANT", description: "Treats depression, anxiety, and panic disorder.", color: "#1ABC9C" },
  { name: "Pristiq", category: "ANTIDEPRESSANT", description: "Treats major depressive disorder.", color: "#E91E63" },
  { name: "Trintellix", category: "ANTIDEPRESSANT", description: "Treats major depressive disorder.", color: "#00BCD4" },
  { name: "Viibryd", category: "ANTIDEPRESSANT", description: "Treats major depressive disorder.", color: "#8BC34A" },
  { name: "Remeron", category: "ANTIDEPRESSANT", description: "Treats depression and insomnia.", color: "#FF5722" },
  
  // Anti-Anxiety
  { name: "Xanax", category: "ANTI-ANXIETY", description: "Treats anxiety and panic disorders.", color: "#9C27B0" },
  { name: "Valium", category: "ANTI-ANXIETY", description: "Treats anxiety, muscle spasms, and seizures.", color: "#3F51B5" },
  { name: "Klonopin", category: "ANTI-ANXIETY", description: "Treats seizure disorders and panic disorder.", color: "#00BCD4" },
  { name: "Ativan", category: "ANTI-ANXIETY", description: "Treats anxiety disorders.", color: "#009688" },
  { name: "Buspar", category: "ANTI-ANXIETY", description: "Treats anxiety disorders.", color: "#4CAF50" },
  { name: "Librium", category: "ANTI-ANXIETY", description: "Treats anxiety and alcohol withdrawal.", color: "#8BC34A" },
  
  // Antipsychotics
  { name: "Abilify", category: "ANTIPSYCHOTIC", description: "Treats schizophrenia, bipolar disorder, and depression.", color: "#673AB7" },
  { name: "Seroquel", category: "ANTIPSYCHOTIC", description: "Treats schizophrenia, bipolar disorder, and depression.", color: "#9C27B0" },
  { name: "Zyprexa", category: "ANTIPSYCHOTIC", description: "Treats schizophrenia and bipolar disorder.", color: "#E91E63" },
  { name: "Risperdal", category: "ANTIPSYCHOTIC", description: "Treats schizophrenia and bipolar disorder.", color: "#F44336" },
  { name: "Latuda", category: "ANTIPSYCHOTIC", description: "Treats schizophrenia and bipolar depression.", color: "#FF5722" },
  { name: "Vraylar", category: "ANTIPSYCHOTIC", description: "Treats schizophrenia and bipolar disorder.", color: "#FF9800" },
  { name: "Rexulti", category: "ANTIPSYCHOTIC", description: "Treats schizophrenia and depression.", color: "#FFC107" },
  { name: "Geodon", category: "ANTIPSYCHOTIC", description: "Treats schizophrenia and bipolar disorder.", color: "#FFEB3B" },
  { name: "Invega", category: "ANTIPSYCHOTIC", description: "Treats schizophrenia.", color: "#CDDC39" },
  { name: "Clozaril", category: "ANTIPSYCHOTIC", description: "Treats severe schizophrenia.", color: "#8BC34A" },
  
  // ADHD Medications
  { name: "Adderall", category: "STIMULANT", description: "Treats ADHD and narcolepsy.", color: "#FF5722" },
  { name: "Ritalin", category: "STIMULANT", description: "Treats ADHD and narcolepsy.", color: "#FF9800" },
  { name: "Concerta", category: "STIMULANT", description: "Treats ADHD.", color: "#FFC107" },
  { name: "Vyvanse", category: "STIMULANT", description: "Treats ADHD and binge eating disorder.", color: "#FFEB3B" },
  { name: "Focalin", category: "STIMULANT", description: "Treats ADHD.", color: "#CDDC39" },
  { name: "Strattera", category: "NON-STIMULANT", description: "Treats ADHD.", color: "#8BC34A" },
  { name: "Intuniv", category: "NON-STIMULANT", description: "Treats ADHD.", color: "#4CAF50" },
  
  // Sleep Medications
  { name: "Ambien", category: "SEDATIVE", description: "Treats insomnia.", color: "#3F51B5" },
  { name: "Lunesta", category: "SEDATIVE", description: "Treats insomnia.", color: "#673AB7" },
  { name: "Sonata", category: "SEDATIVE", description: "Treats insomnia.", color: "#9C27B0" },
  { name: "Rozerem", category: "SEDATIVE", description: "Treats insomnia.", color: "#E91E63" },
  { name: "Belsomra", category: "SEDATIVE", description: "Treats insomnia.", color: "#F44336" },
  { name: "Dayvigo", category: "SEDATIVE", description: "Treats insomnia.", color: "#FF5722" },
  
  // Pain Medications
  { name: "Vicodin", category: "PAIN RELIEVER", description: "Treats moderate to severe pain.", color: "#E74C3C" },
  { name: "OxyContin", category: "PAIN RELIEVER", description: "Treats severe chronic pain.", color: "#C0392B" },
  { name: "Percocet", category: "PAIN RELIEVER", description: "Treats moderate to severe pain.", color: "#9B59B6" },
  { name: "Tramadol", category: "PAIN RELIEVER", description: "Treats moderate pain.", color: "#8E44AD" },
  { name: "Dilaudid", category: "PAIN RELIEVER", description: "Treats severe pain.", color: "#2980B9" },
  { name: "Norco", category: "PAIN RELIEVER", description: "Treats moderate to severe pain.", color: "#1ABC9C" },
  { name: "Ultram", category: "PAIN RELIEVER", description: "Treats moderate pain.", color: "#16A085" },
  
  // Cholesterol & Heart
  { name: "Lipitor", category: "CHOLESTEROL", description: "Lowers cholesterol and triglycerides.", color: "#F39C12" },
  { name: "Crestor", category: "CHOLESTEROL", description: "Lowers cholesterol and triglycerides.", color: "#E67E22" },
  { name: "Zocor", category: "CHOLESTEROL", description: "Lowers cholesterol and triglycerides.", color: "#D35400" },
  { name: "Pravachol", category: "CHOLESTEROL", description: "Lowers cholesterol.", color: "#E74C3C" },
  { name: "Zetia", category: "CHOLESTEROL", description: "Lowers cholesterol absorption.", color: "#C0392B" },
  { name: "Repatha", category: "CHOLESTEROL", description: "Lowers LDL cholesterol.", color: "#9B59B6" },
  { name: "Praluent", category: "CHOLESTEROL", description: "Lowers LDL cholesterol.", color: "#8E44AD" },
  
  // Blood Pressure
  { name: "Lisinopril", category: "BLOOD PRESSURE", description: "Treats high blood pressure and heart failure.", color: "#3498DB" },
  { name: "Losartan", category: "BLOOD PRESSURE", description: "Treats high blood pressure.", color: "#2980B9" },
  { name: "Norvasc", category: "BLOOD PRESSURE", description: "Treats high blood pressure and angina.", color: "#1ABC9C" },
  { name: "Metoprolol", category: "BLOOD PRESSURE", description: "Treats high blood pressure and heart failure.", color: "#16A085" },
  { name: "Diovan", category: "BLOOD PRESSURE", description: "Treats high blood pressure.", color: "#27AE60" },
  { name: "Benicar", category: "BLOOD PRESSURE", description: "Treats high blood pressure.", color: "#2ECC71" },
  { name: "Micardis", category: "BLOOD PRESSURE", description: "Treats high blood pressure.", color: "#F1C40F" },
  { name: "Coreg", category: "BLOOD PRESSURE", description: "Treats high blood pressure and heart failure.", color: "#F39C12" },
  
  // Diabetes
  { name: "Ozempic", category: "DIABETES", description: "Treats type 2 diabetes and aids weight loss.", color: "#2ECC71" },
  { name: "Wegovy", category: "WEIGHT LOSS", description: "Aids chronic weight management.", color: "#27AE60" },
  { name: "Metformin", category: "DIABETES", description: "Treats type 2 diabetes.", color: "#16A085" },
  { name: "Jardiance", category: "DIABETES", description: "Treats type 2 diabetes.", color: "#1ABC9C" },
  { name: "Farxiga", category: "DIABETES", description: "Treats type 2 diabetes and heart failure.", color: "#3498DB" },
  { name: "Trulicity", category: "DIABETES", description: "Treats type 2 diabetes.", color: "#2980B9" },
  { name: "Januvia", category: "DIABETES", description: "Treats type 2 diabetes.", color: "#9B59B6" },
  { name: "Invokana", category: "DIABETES", description: "Treats type 2 diabetes.", color: "#8E44AD" },
  { name: "Victoza", category: "DIABETES", description: "Treats type 2 diabetes.", color: "#E74C3C" },
  { name: "Mounjaro", category: "DIABETES", description: "Treats type 2 diabetes and aids weight loss.", color: "#C0392B" },
  
  // Antibiotics
  { name: "Amoxil", category: "ANTIBIOTIC", description: "Treats bacterial infections.", color: "#E74C3C" },
  { name: "Zithromax", category: "ANTIBIOTIC", description: "Treats bacterial infections.", color: "#C0392B" },
  { name: "Cipro", category: "ANTIBIOTIC", description: "Treats bacterial infections.", color: "#9B59B6" },
  { name: "Augmentin", category: "ANTIBIOTIC", description: "Treats bacterial infections.", color: "#8E44AD" },
  { name: "Keflex", category: "ANTIBIOTIC", description: "Treats bacterial infections.", color: "#2980B9" },
  { name: "Levaquin", category: "ANTIBIOTIC", description: "Treats bacterial infections.", color: "#3498DB" },
  { name: "Bactrim", category: "ANTIBIOTIC", description: "Treats bacterial infections.", color: "#1ABC9C" },
  { name: "Flagyl", category: "ANTIBIOTIC", description: "Treats bacterial and parasitic infections.", color: "#16A085" },
  
  // Allergy & Respiratory
  { name: "Zyrtec", category: "ANTIHISTAMINE", description: "Treats allergies.", color: "#3498DB" },
  { name: "Allegra", category: "ANTIHISTAMINE", description: "Treats allergies.", color: "#2980B9" },
  { name: "Claritin", category: "ANTIHISTAMINE", description: "Treats allergies.", color: "#1ABC9C" },
  { name: "Singulair", category: "RESPIRATORY", description: "Treats asthma and allergies.", color: "#16A085" },
  { name: "Flonase", category: "NASAL SPRAY", description: "Treats nasal allergies.", color: "#27AE60" },
  { name: "Nasonex", category: "NASAL SPRAY", description: "Treats nasal allergies.", color: "#2ECC71" },
  { name: "Advair", category: "RESPIRATORY", description: "Treats asthma and COPD.", color: "#F1C40F" },
  { name: "Symbicort", category: "RESPIRATORY", description: "Treats asthma and COPD.", color: "#F39C12" },
  { name: "Spiriva", category: "RESPIRATORY", description: "Treats COPD.", color: "#E67E22" },
  { name: "Breo", category: "RESPIRATORY", description: "Treats asthma and COPD.", color: "#D35400" },
  
  // Acid Reflux & GI
  { name: "Nexium", category: "ACID REDUCER", description: "Treats heartburn, GERD, and ulcers.", color: "#9B59B6" },
  { name: "Prilosec", category: "ACID REDUCER", description: "Treats heartburn, GERD, and ulcers.", color: "#8E44AD" },
  { name: "Prevacid", category: "ACID REDUCER", description: "Treats heartburn, GERD, and ulcers.", color: "#673AB7" },
  { name: "Protonix", category: "ACID REDUCER", description: "Treats heartburn, GERD, and ulcers.", color: "#3F51B5" },
  { name: "Zantac", category: "ACID REDUCER", description: "Treats heartburn and ulcers.", color: "#2196F3" },
  { name: "Pepcid", category: "ACID REDUCER", description: "Treats heartburn and ulcers.", color: "#03A9F4" },
  { name: "Linzess", category: "GI MEDICATION", description: "Treats IBS with constipation.", color: "#00BCD4" },
  
  // Immunology & Biologics
  { name: "Humira", category: "BIOLOGIC", description: "Treats autoimmune diseases like arthritis.", color: "#E91E63" },
  { name: "Enbrel", category: "BIOLOGIC", description: "Treats autoimmune diseases.", color: "#F44336" },
  { name: "Remicade", category: "BIOLOGIC", description: "Treats autoimmune diseases.", color: "#FF5722" },
  { name: "Stelara", category: "BIOLOGIC", description: "Treats psoriasis and Crohn's disease.", color: "#FF9800" },
  { name: "Cosentyx", category: "BIOLOGIC", description: "Treats psoriasis and arthritis.", color: "#FFC107" },
  { name: "Dupixent", category: "BIOLOGIC", description: "Treats eczema and asthma.", color: "#FFEB3B" },
  { name: "Skyrizi", category: "BIOLOGIC", description: "Treats psoriasis.", color: "#CDDC39" },
  { name: "Rinvoq", category: "BIOLOGIC", description: "Treats rheumatoid arthritis.", color: "#8BC34A" },
  { name: "Tremfya", category: "BIOLOGIC", description: "Treats psoriasis.", color: "#4CAF50" },
  { name: "Taltz", category: "BIOLOGIC", description: "Treats psoriasis and arthritis.", color: "#009688" },
  
  // Cancer/Oncology
  { name: "Keytruda", category: "ONCOLOGY", description: "Cancer immunotherapy.", color: "#E74C3C" },
  { name: "Opdivo", category: "ONCOLOGY", description: "Cancer immunotherapy.", color: "#C0392B" },
  { name: "Rituxan", category: "ONCOLOGY", description: "Treats certain cancers.", color: "#9B59B6" },
  { name: "Herceptin", category: "ONCOLOGY", description: "Treats breast and stomach cancer.", color: "#8E44AD" },
  { name: "Avastin", category: "ONCOLOGY", description: "Treats various cancers.", color: "#2980B9" },
  { name: "Revlimid", category: "ONCOLOGY", description: "Treats multiple myeloma.", color: "#3498DB" },
  { name: "Ibrance", category: "ONCOLOGY", description: "Treats breast cancer.", color: "#1ABC9C" },
  { name: "Imbruvica", category: "ONCOLOGY", description: "Treats blood cancers.", color: "#16A085" },
  { name: "Tagrisso", category: "ONCOLOGY", description: "Treats lung cancer.", color: "#27AE60" },
  { name: "Darzalex", category: "ONCOLOGY", description: "Treats multiple myeloma.", color: "#2ECC71" },
  
  // Blood Thinners
  { name: "Eliquis", category: "ANTICOAGULANT", description: "Prevents blood clots.", color: "#E74C3C" },
  { name: "Xarelto", category: "ANTICOAGULANT", description: "Prevents blood clots.", color: "#C0392B" },
  { name: "Pradaxa", category: "ANTICOAGULANT", description: "Prevents blood clots.", color: "#9B59B6" },
  { name: "Coumadin", category: "ANTICOAGULANT", description: "Prevents blood clots.", color: "#8E44AD" },
  { name: "Plavix", category: "ANTIPLATELET", description: "Prevents heart attack and stroke.", color: "#2980B9" },
  { name: "Brilinta", category: "ANTIPLATELET", description: "Prevents blood clots.", color: "#3498DB" },
  
  // Seizure/Epilepsy
  { name: "Topamax", category: "ANTICONVULSANT", description: "Treats seizures and migraines.", color: "#9C27B0" },
  { name: "Lamictal", category: "ANTICONVULSANT", description: "Treats seizures and bipolar disorder.", color: "#673AB7" },
  { name: "Keppra", category: "ANTICONVULSANT", description: "Treats seizures.", color: "#3F51B5" },
  { name: "Depakote", category: "ANTICONVULSANT", description: "Treats seizures and bipolar disorder.", color: "#2196F3" },
  { name: "Tegretol", category: "ANTICONVULSANT", description: "Treats seizures and nerve pain.", color: "#03A9F4" },
  { name: "Dilantin", category: "ANTICONVULSANT", description: "Treats seizures.", color: "#00BCD4" },
  { name: "Lyrica", category: "ANTICONVULSANT", description: "Treats nerve pain and fibromyalgia.", color: "#009688" },
  { name: "Gabapentin", category: "ANTICONVULSANT", description: "Treats seizures and nerve pain.", color: "#4CAF50" },
  
  // Muscle Relaxants
  { name: "Flexeril", category: "MUSCLE RELAXANT", description: "Treats muscle spasms.", color: "#FF5722" },
  { name: "Soma", category: "MUSCLE RELAXANT", description: "Treats muscle spasms.", color: "#FF9800" },
  { name: "Zanaflex", category: "MUSCLE RELAXANT", description: "Treats muscle spasms.", color: "#FFC107" },
  { name: "Baclofen", category: "MUSCLE RELAXANT", description: "Treats muscle spasms.", color: "#FFEB3B" },
  { name: "Robaxin", category: "MUSCLE RELAXANT", description: "Treats muscle spasms.", color: "#CDDC39" },
  
  // Thyroid
  { name: "Synthroid", category: "THYROID", description: "Treats hypothyroidism.", color: "#3498DB" },
  { name: "Levoxyl", category: "THYROID", description: "Treats hypothyroidism.", color: "#2980B9" },
  { name: "Armour", category: "THYROID", description: "Treats hypothyroidism.", color: "#1ABC9C" },
  { name: "Cytomel", category: "THYROID", description: "Treats hypothyroidism.", color: "#16A085" },
  
  // Migraine
  { name: "Imitrex", category: "MIGRAINE", description: "Treats migraine headaches.", color: "#E74C3C" },
  { name: "Maxalt", category: "MIGRAINE", description: "Treats migraine headaches.", color: "#C0392B" },
  { name: "Zomig", category: "MIGRAINE", description: "Treats migraine headaches.", color: "#9B59B6" },
  { name: "Relpax", category: "MIGRAINE", description: "Treats migraine headaches.", color: "#8E44AD" },
  { name: "Aimovig", category: "MIGRAINE", description: "Prevents migraine headaches.", color: "#2980B9" },
  { name: "Ajovy", category: "MIGRAINE", description: "Prevents migraine headaches.", color: "#3498DB" },
  { name: "Emgality", category: "MIGRAINE", description: "Prevents migraine headaches.", color: "#1ABC9C" },
  { name: "Nurtec", category: "MIGRAINE", description: "Treats and prevents migraines.", color: "#16A085" },
  { name: "Ubrelvy", category: "MIGRAINE", description: "Treats acute migraines.", color: "#27AE60" },
  
  // Erectile Dysfunction
  { name: "Viagra", category: "UROLOGICAL", description: "Treats erectile dysfunction.", color: "#3498DB" },
  { name: "Cialis", category: "UROLOGICAL", description: "Treats erectile dysfunction.", color: "#2980B9" },
  { name: "Levitra", category: "UROLOGICAL", description: "Treats erectile dysfunction.", color: "#1ABC9C" },
  { name: "Stendra", category: "UROLOGICAL", description: "Treats erectile dysfunction.", color: "#16A085" },
  
  // Osteoporosis
  { name: "Fosamax", category: "BONE HEALTH", description: "Treats osteoporosis.", color: "#F1C40F" },
  { name: "Boniva", category: "BONE HEALTH", description: "Treats osteoporosis.", color: "#F39C12" },
  { name: "Prolia", category: "BONE HEALTH", description: "Treats osteoporosis.", color: "#E67E22" },
  { name: "Evenity", category: "BONE HEALTH", description: "Treats osteoporosis.", color: "#D35400" },
  
  // Birth Control
  { name: "Yaz", category: "CONTRACEPTIVE", description: "Birth control pill.", color: "#E91E63" },
  { name: "Ortho", category: "CONTRACEPTIVE", description: "Birth control pill.", color: "#F44336" },
  { name: "Mirena", category: "CONTRACEPTIVE", description: "IUD birth control.", color: "#FF5722" },
  { name: "Nexplanon", category: "CONTRACEPTIVE", description: "Implant birth control.", color: "#FF9800" },
  
  // Opioid Treatment
  { name: "Suboxone", category: "ADDICTION", description: "Treats opioid dependence.", color: "#E74C3C" },
  { name: "Vivitrol", category: "ADDICTION", description: "Treats alcohol and opioid dependence.", color: "#C0392B" },
  { name: "Narcan", category: "OVERDOSE", description: "Reverses opioid overdose.", color: "#9B59B6" },
  
  // HIV/AIDS
  { name: "Truvada", category: "HIV", description: "Treats and prevents HIV.", color: "#3498DB" },
  { name: "Descovy", category: "HIV", description: "Treats and prevents HIV.", color: "#2980B9" },
  { name: "Biktarvy", category: "HIV", description: "Treats HIV.", color: "#1ABC9C" },
  { name: "Genvoya", category: "HIV", description: "Treats HIV.", color: "#16A085" },
  
  // Hepatitis
  { name: "Harvoni", category: "HEPATITIS", description: "Treats hepatitis C.", color: "#F39C12" },
  { name: "Sovaldi", category: "HEPATITIS", description: "Treats hepatitis C.", color: "#E67E22" },
  { name: "Epclusa", category: "HEPATITIS", description: "Treats hepatitis C.", color: "#D35400" },
  { name: "Mavyret", category: "HEPATITIS", description: "Treats hepatitis C.", color: "#E74C3C" },
  
  // MS (Multiple Sclerosis)
  { name: "Tecfidera", category: "MS", description: "Treats multiple sclerosis.", color: "#9C27B0" },
  { name: "Ocrevus", category: "MS", description: "Treats multiple sclerosis.", color: "#673AB7" },
  { name: "Tysabri", category: "MS", description: "Treats multiple sclerosis.", color: "#3F51B5" },
  { name: "Gilenya", category: "MS", description: "Treats multiple sclerosis.", color: "#2196F3" },
  { name: "Aubagio", category: "MS", description: "Treats multiple sclerosis.", color: "#03A9F4" },
  { name: "Kesimpta", category: "MS", description: "Treats multiple sclerosis.", color: "#00BCD4" },
  
  // Eye Care
  { name: "Restasis", category: "EYE CARE", description: "Treats chronic dry eye.", color: "#3498DB" },
  { name: "Xiidra", category: "EYE CARE", description: "Treats dry eye disease.", color: "#2980B9" },
  { name: "Lumigan", category: "EYE CARE", description: "Treats glaucoma.", color: "#1ABC9C" },
  { name: "Xalatan", category: "EYE CARE", description: "Treats glaucoma.", color: "#16A085" },
  
  // Skin Conditions
  { name: "Otezla", category: "DERMATOLOGY", description: "Treats psoriasis and psoriatic arthritis.", color: "#FF5722" },
  { name: "Eucrisa", category: "DERMATOLOGY", description: "Treats eczema.", color: "#FF9800" },
  { name: "Epiduo", category: "DERMATOLOGY", description: "Treats acne.", color: "#FFC107" },
  { name: "Differin", category: "DERMATOLOGY", description: "Treats acne.", color: "#FFEB3B" },
  
  // Miscellaneous
  { name: "Provigil", category: "WAKEFULNESS", description: "Treats narcolepsy and sleep apnea.", color: "#F39C12" },
  { name: "Nuvigil", category: "WAKEFULNESS", description: "Treats narcolepsy and sleep apnea.", color: "#E67E22" },
  { name: "Xyrem", category: "NARCOLEPSY", description: "Treats narcolepsy with cataplexy.", color: "#D35400" },
  { name: "Entresto", category: "HEART FAILURE", description: "Treats chronic heart failure.", color: "#E74C3C" },
  { name: "Farxiga", category: "HEART/KIDNEY", description: "Treats diabetes and heart failure.", color: "#C0392B" },
  { name: "Verzenio", category: "ONCOLOGY", description: "Treats breast cancer.", color: "#9B59B6" },
  { name: "Kisqali", category: "ONCOLOGY", description: "Treats breast cancer.", color: "#8E44AD" },
  { name: "Xeljanz", category: "IMMUNOLOGY", description: "Treats rheumatoid arthritis.", color: "#2980B9" },
  { name: "Olumiant", category: "IMMUNOLOGY", description: "Treats rheumatoid arthritis.", color: "#3498DB" },
  { name: "Orencia", category: "IMMUNOLOGY", description: "Treats rheumatoid arthritis.", color: "#1ABC9C" },
  { name: "Actemra", category: "IMMUNOLOGY", description: "Treats rheumatoid arthritis.", color: "#16A085" },
  { name: "Simponi", category: "IMMUNOLOGY", description: "Treats autoimmune diseases.", color: "#27AE60" },
  { name: "Cimzia", category: "IMMUNOLOGY", description: "Treats autoimmune diseases.", color: "#2ECC71" },
];

// Pill shapes for variety
const pillShapes = ['capsule', 'round', 'oval', 'diamond'];

// Add pillShape to each drug if not present
drugNames.forEach(drug => {
  if (!drug.pillShape) {
    drug.pillShape = pillShapes[Math.floor(Math.random() * pillShapes.length)];
  }
  if (!drug.pillColor) {
    drug.pillColor = '#FFFFFF';
  }
});

export default drugNames;
