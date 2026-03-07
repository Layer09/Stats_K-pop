// ===============================
// Fonction pour afficher une page
// ===============================
let csvData = null; // stocke les données CSV globalement
const chartInstances = {}; // stocke les instances Chart.js pour destruction si nécessaire

function showPage(page) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById(page).classList.add('active');

    // Créer les graphiques uniquement lorsque la page devient active
    if (csvData) {
        createGraphsForProfile(page, csvData);
        createTablesForProfile(page, csvData);
    }
}

// ===============================
// Fonctions utilitaires
// ===============================
function cleanValue(value) {
    return (value === null || value === undefined || value === "")
        ? "Non renseigné"
        : value;
}

function getSexeColor(label) {
    switch (label) {
        case "Fille": return "#FF69B4";
        case "Gars": return "#6EC1FF";
        case "Mixte": return "#9B59FF";
        case "Non renseigné": return "#1F3A93";
        default: return "#1F3A93";
    }
}

// Couleurs pastelles par sexe
function getPastelSexeColor(label) {
    switch (label) {
        case "Fille": return "#ffd5f6";      // rose pastel
        case "Gars": return "#c0e3f6";       // bleu clair pastel
        case "Mixte": return "#c3b7e7";      // violet pastel
        case "Non renseigné": return "#a1b4ed"; // bleu foncé pastel
        default: return "#CCCCCC";
    }
}

// Autres couleurs
function getChartColors(numColors) {
    const allColors = [
        "#0000F1", "#1BB8FF", "#40FFD2", "#8AFF87", "#D2FF40", "#FFFF09",
        "#FFC400", "#FF6C00", "#F10700", "#F10371", "#F100BF", "#AD00F1"
    ];
    const subsetColors = [
        "#0000F1", "#40FFD2", "#8AFF87", "#FFFF09", "#FFC400",
        "#F10700", "#F100BF", "#AD00F1"
    ];
    const miniColors = [
        "#0000F1", "#8AFF87", "#FFFF09", "#F10700", "#AD00F1"
    ];
    if (numColors <= 3) {
        return ["#1BB8FF", "#FFFF09", "#F10700"]; // Moins de 3 couleurs
    } else if (numColors <= 5) {
        return miniColors.slice(0, numColors); // Moins de 5 mais plus que 3 couleurs
    } else if (numColors <= 12) {
        return subsetColors.slice(0, numColors); // Moins de 12 mais plus que 5 couleurs
    } else {
        return allColors; // Plus de 12 couleurs
    }
}

function getNotes(d, profil){

    function getValidNumber(value){
        if(value === undefined || value === null) return null;
        const cleaned = String(value).trim().replace(",", ".");
        if(cleaned === "") return null;
        const num = Number(cleaned);
        return isNaN(num) ? null : num;
    }

    let notes=[];
    const jures=["Laurana","Andy","Anna","Gwenola","Melyssa"];

    if(profil==="Moyenne"){

        jures.forEach(j=>{
            const n2 = getValidNumber(d[`Note_2_${j}`]);
            const n1 = getValidNumber(d[`Note_1_${j}`]);

            if(n2 !== null){
                notes.push(n2);   // priorité note 2
            } else if(n1 !== null){
                notes.push(n1);
            }
        });

    } else {

        const n2 = getValidNumber(d[`Note_2_${profil}`]);
        const n1 = getValidNumber(d[`Note_1_${profil}`]);

        if(n2 !== null){
            notes.push(n2);
        } else if(n1 !== null){
            notes.push(n1);
        }
    }

    return notes;
}

// ===============================
// GRAPHIQUES
// ===============================

// Pie chart : Nombre de musiques par sexe
function graphRepartitionSexe(ctx, data, profil) {
    const counts = { "Fille": 0, "Gars": 0, "Mixte": 0, "Non renseigné": 0 };

    data.forEach(d => {
        const sexe = cleanValue(d.Sexe);
        if (profil === "Moyenne") {
            counts[sexe] += 1;
        } else {
            // compter uniquement si le juré a donné une note
            const note1 = parseFloat(d[`Note_1_${profil}`]);
            const note2 = parseFloat(d[`Note_2_${profil}`]);
            if (!isNaN(note1) || !isNaN(note2)) counts[sexe] += 1;
        }
    });

    // Détruire le chart précédent si nécessaire
    if (chartInstances[`pie_sexe_${profil}`]) chartInstances[`pie_sexe_${profil}`].destroy();

    chartInstances[`pie_sexe_${profil}`] = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(counts),
            datasets: [{
                data: Object.values(counts),
                backgroundColor: Object.keys(counts).map(getSexeColor)
            }]
        },
        options: {
            responsive: true,
            animation: {
                duration: 800,
                animateRotate: true,
                animateScale: true
            },
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } }
        }
    });
}

// Bar chart : Moyenne des notes par sexe
function graphMoyenneParSexe(ctx, data, profil) {
    const sums = { "Fille": 0, "Gars": 0, "Mixte": 0, "Non renseigné": 0 };
    const counts = { "Fille": 0, "Gars": 0, "Mixte": 0, "Non renseigné": 0 };

    data.forEach(d => {
        const sexe = cleanValue(d.Sexe);
        const notes = getNotes(d, profil);

        if (notes.length > 0) {
            sums[sexe] += notes.reduce((a, b) => a + b, 0) / notes.length;
            counts[sexe] += 1;
        }
    });

    const averages = Object.keys(sums).map(k => counts[k] > 0 ? sums[k] / counts[k] : 0);

    // Détruire le chart précédent si nécessaire
    if (chartInstances[`bar_sexe_${profil}`]) chartInstances[`bar_sexe_${profil}`].destroy();

    // Forcer le canvas à recalculer sa taille
    ctx.canvas.parentNode.style.position = 'relative';
    ctx.canvas.style.width = '100%';
    ctx.canvas.style.height = '300px';
    ctx.canvas.width = ctx.canvas.offsetWidth;
    ctx.canvas.height = ctx.canvas.offsetHeight;

    chartInstances[`bar_sexe_${profil}`] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(sums),
            datasets: [{
                label: profil === "Moyenne" ? "Moyenne des notes" : `Notes de ${profil}`,
                data: averages,
                backgroundColor: Object.keys(sums).map(getSexeColor)
            }]
        },
        options: {
            responsive: true,
            animation: {
                duration: 800,
                easing: 'easeOutCubic',
                from: 0
            },
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, max: 10 } }
        }
    });
}


// Pie chart : Nombre de musiques par année
function graphRepartitionAnnee(ctx, data, profil) {
    const counts = {};

    data.forEach(d => {
        const annee = cleanValue(d.Annee); // Récupérer l'année
        if (!counts[annee]) counts[annee] = 0; // Initialiser si nécessaire

        if (profil === "Moyenne") {
            counts[annee] += 1;
        } else {
            // compter uniquement si le juré a donné une note
            const note1 = parseFloat(d[`Note_1_${profil}`]);
            const note2 = parseFloat(d[`Note_2_${profil}`]);
            if (!isNaN(note1) || !isNaN(note2)) counts[annee] += 1;
        }
    });

    // Détruire le chart précédent si nécessaire
    if (chartInstances[`pie_annee_${profil}`]) chartInstances[`pie_annee_${profil}`].destroy();

    chartInstances[`pie_annee_${profil}`] = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(counts),
            datasets: [{
                data: Object.values(counts),
                backgroundColor: getChartColors(Object.keys(counts).length)
            }]
        },
        options: {
            responsive: true,
            animation: {
                duration: 800,
                animateRotate: true,
                animateScale: true
            },
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } }
        }
    });
}

// Bar chart : Moyenne des notes par année
function graphMoyenneParAnnee(ctx, data, profil) {
    const sums = {};
    const counts = {};

    data.forEach(d => {
        const annee = cleanValue(d.Annee); // Récupérer l'année
        if (!sums[annee]) sums[annee] = 0;
        if (!counts[annee]) counts[annee] = 0;

        const notes = getNotes(d, profil);

        if (notes.length > 0) {
            sums[annee] += notes.reduce((a, b) => a + b, 0) / notes.length;
            counts[annee] += 1;
        }
    });

    const averages = Object.keys(sums).map(k => counts[k] > 0 ? sums[k] / counts[k] : 0);

    // Détruire le chart précédent si nécessaire
    if (chartInstances[`bar_annee_${profil}`]) chartInstances[`bar_annee_${profil}`].destroy();

    // Forcer le canvas à recalculer sa taille
    ctx.canvas.parentNode.style.position = 'relative';
    ctx.canvas.style.width = '100%';
    ctx.canvas.style.height = '300px';
    ctx.canvas.width = ctx.canvas.offsetWidth;
    ctx.canvas.height = ctx.canvas.offsetHeight;

    chartInstances[`bar_annee_${profil}`] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(sums),
            datasets: [{
                label: profil === "Moyenne" ? "Moyenne des notes" : `Moyenne : ${profil}`,
                data: averages,
                backgroundColor: getChartColors(Object.keys(counts).length)
            }]
        },
        options: {
            responsive: true,
            animation: {
                duration: 800,
                easing: 'easeOutCubic',
                from: 0
            },
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, max: 10 } }
        }
    });
}


// Bar chart : Moyenne des notes par épisode
function graphMoyenneParEpisode(ctx, data, profil) {
    const sums = {};
    const counts = {};

    data.forEach(d => {
        const episode = cleanValue(d.Episode); // Récupérer l'épisode
        if (!sums[episode]) sums[episode] = 0;
        if (!counts[episode]) counts[episode] = 0;

        const notes = getNotes(d, profil);

        if (notes.length > 0) {
            sums[episode] += notes.reduce((a, b) => a + b, 0) / notes.length;
            counts[episode] += 1;
        }
    });

    const averages = Object.keys(sums).map(k => counts[k] > 0 ? sums[k] / counts[k] : 0);

    // Détruire le chart précédent si nécessaire
    if (chartInstances[`bar_episode_${profil}`]) chartInstances[`bar_episode_${profil}`].destroy();

    // Forcer le canvas à recalculer sa taille
    ctx.canvas.parentNode.style.position = 'relative';
    ctx.canvas.style.width = '100%';
    ctx.canvas.style.height = '300px';
    ctx.canvas.width = ctx.canvas.offsetWidth;
    ctx.canvas.height = ctx.canvas.offsetHeight;

    chartInstances[`bar_episode_${profil}`] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(sums),
            datasets: [{
                label: profil === "Moyenne" ? "Moyenne des notes" : `Moyenne : ${profil}`,
                data: averages,
                backgroundColor: getChartColors(Object.keys(counts).length)
            }]
        },
        options: {
            responsive: true,
            animation: {
                duration: 800,
                easing: 'easeOutCubic',
                from: 0
            },
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, max: 10 } }
        }
    });
}


// Bar chart : Moyenne des notes par numéro
function graphMoyenneParNumero(ctx, data, profil) {
    const sums = {};
    const counts = {};

    data.forEach(d => {
        const numero = cleanValue(d.Numero); // Récupérer le numéro
        if (!sums[numero]) sums[numero] = 0;
        if (!counts[numero]) counts[numero] = 0;

        const notes = getNotes(d, profil);

        if (notes.length > 0) {
            sums[numero] += notes.reduce((a, b) => a + b, 0) / notes.length;
            counts[numero] += 1;
        }
    });

    const averages = Object.keys(sums).map(k => counts[k] > 0 ? sums[k] / counts[k] : 0);

    // Détruire le chart précédent si nécessaire
    if (chartInstances[`bar_numero_${profil}`]) chartInstances[`bar_numero_${profil}`].destroy();

    // Forcer le canvas à recalculer sa taille
    ctx.canvas.parentNode.style.position = 'relative';
    ctx.canvas.style.width = '100%';
    ctx.canvas.style.height = '300px';
    ctx.canvas.width = ctx.canvas.offsetWidth;
    ctx.canvas.height = ctx.canvas.offsetHeight;

    chartInstances[`bar_numero_${profil}`] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(sums),
            datasets: [{
                label: profil === "Moyenne" ? "Moyenne des notes" : `Moyenne : ${profil}`,
                data: averages,
                backgroundColor: getChartColors(Object.keys(counts).length)
            }]
        },
        options: {
            responsive: true,
            animation: {
                duration: 800,
                easing: 'easeOutCubic',
                from: 0
            },
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, max: 10 } }
        }
    });
}


// Table : Top artistes
function fillTopArtistes(tableId,data,profil){

    const table = document.getElementById(tableId);

    if (!table) {
        console.warn(`Table ${tableId} introuvable`);
        return;
    }

    const tbody = table.querySelector("tbody");

    if (!tbody) {
        console.warn(`tbody absent pour ${tableId}`);
        return;
    }

    tbody.innerHTML = "";

    const groupBy=document.getElementById(`group_artistes_top_${profil}`).checked;
    const minOccur=document.getElementById(`filter_artistes_top_${profil}`).checked;

    let stats={};

    data.forEach(d=>{
        const artiste=cleanValue(d.Artiste);
        const groupe=cleanValue(d.Groupe);
        const generation=cleanValue(d.Generation);
        const sexe=cleanValue(d.Sexe);
        const notes=getNotes(d,profil);

        if(notes.length===0) return;

        let key=artiste;
        if(groupBy && groupe!=="Non renseigné" && groupe!==""){
            key=groupe;
        }

        if(!stats[key]){
            stats[key]={sum:0,count:0,sexe:sexe,generation:generation};
        }

        stats[key].sum+=notes.reduce((a,b)=>a+b,0)/notes.length;
        stats[key].count++;
    });

    let entries=Object.entries(stats);

    if(minOccur){
        entries=entries.filter(([k,v])=>v.count>=5);
    }

    entries.sort((a,b)=>b[1].sum/b[1].count - a[1].sum/a[1].count);

    let rank=0;
    let previousNote=null;

    entries.slice(0,10).forEach(([name,st],index)=>{
        const avg=st.sum/st.count;

        if(avg!==previousNote){
            rank=index+1;
            previousNote=avg;
        }

        const tr=document.createElement("tr");
        color = getPastelSexeColor(st.sexe);
        tr.style.setProperty("--bs-table-bg", color);

        tr.innerHTML=`
            <td>${rank}</td>
            <td>${name}</td>
            <td>${st.generation}</td>
            <td>${st.count}</td>
            <td>${avg.toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });
}



// Table : Bottom artistes
function fillBottomArtistes(tableId,data,profil){

    const table = document.getElementById(tableId);

    if (!table) {
        console.warn(`Table ${tableId} introuvable`);
        return;
    }

    const tbody = table.querySelector("tbody");

    if (!tbody) {
        console.warn(`tbody absent pour ${tableId}`);
        return;
    }

    tbody.innerHTML = "";

    const groupBy=document.getElementById(`group_artistes_bottom_${profil}`).checked;
    const minOccur=document.getElementById(`filter_artistes_bottom_${profil}`).checked;

    let stats={};

    data.forEach(d=>{
        const artiste=cleanValue(d.Artiste);
        const groupe=cleanValue(d.Groupe);
        const generation=cleanValue(d.Generation);
        const sexe=cleanValue(d.Sexe);
        const notes=getNotes(d,profil);

        if(notes.length===0) return;

        let key=artiste;
        if(groupBy && groupe!=="Non renseigné" && groupe!==""){
            key=groupe;
        }

        if(!stats[key]){
            stats[key]={sum:0,count:0,sexe:sexe,generation:generation};
        }

        stats[key].sum+=notes.reduce((a,b)=>a+b,0)/notes.length;
        stats[key].count++;
    });

    let entries=Object.entries(stats);

    if(minOccur){
        entries=entries.filter(([k,v])=>v.count>=5);
    }

    entries.sort((a,b)=>a[1].sum/a[1].count - b[1].sum/b[1].count);

    const total=entries.length;
    let rank=total;
    let previousNote=null;

    entries.slice(0,10).forEach(([name,st],index)=>{
        const avg=st.sum/st.count;

        if(avg!==previousNote){
            rank=total-index;
            previousNote=avg;
        }

        const tr=document.createElement("tr");
        color = getPastelSexeColor(st.sexe);
        tr.style.setProperty("--bs-table-bg", color);

        tr.innerHTML=`
            <td>${rank}</td>
            <td>${name}</td>
            <td>${st.generation}</td>
            <td>${st.count}</td>
            <td>${avg.toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Table: Top musiques
function fillTopMusiques(tableId,data,profil){

    const table = document.getElementById(tableId);

    if (!table) {
        console.warn(`Table ${tableId} introuvable`);
        return;
    }

    const tbody = table.querySelector("tbody");

    if (!tbody) {
        console.warn(`tbody absent pour ${tableId}`);
        return;
    }

    tbody.innerHTML = "";

    const label=document.getElementById(`top_label_note_${profil}`);
    if(label){
        label.innerText = profil==="Moyenne" ? "Note moyenne" : "Note";
    }

    let musiques=[];

    data.forEach(d=>{
        const notes=getNotes(d,profil);
        if(notes.length===0) return;

        const avg=notes.reduce((a,b)=>a+b,0)/notes.length;

        musiques.push({
            titre:cleanValue(d.Titre),
            artiste:cleanValue(d.Artiste),
            annee:cleanValue(d.Annee),
            moyenne:avg,
            sexe:cleanValue(d.Sexe)
        });
    });

    musiques.sort((a,b)=>b.moyenne-a.moyenne);

    let selected=[];

    if(profil==="Moyenne"){
        let i=0;
        while(i<musiques.length && (i<10 || musiques[i].moyenne===musiques[9].moyenne)){
            selected.push(musiques[i]);
            i++;
        }
    } else {
        selected=musiques.filter(m=>m.moyenne===10);
    }

    selected.forEach(m=>{
        const tr=document.createElement("tr");
        color = getPastelSexeColor(m.sexe);
        tr.style.setProperty("--bs-table-bg", color);

        tr.innerHTML=`
            <td>${m.titre}</td>
            <td>${m.artiste}</td>
            <td>${m.annee}</td>
            `;
        tbody.appendChild(tr);
    });
}

// Table: Bottom Musiques
function fillBottomMusiques(tableId,data,profil){

    const table = document.getElementById(tableId);

    if (!table) {
        console.warn(`Table ${tableId} introuvable`);
        return;
    }

    const tbody = table.querySelector("tbody");

    if (!tbody) {
        console.warn(`tbody absent pour ${tableId}`);
        return;
    }

    tbody.innerHTML = "";

    const label=document.getElementById(`bottom_label_note_${profil}`);
    if(label){
        label.innerText = profil==="Moyenne" ? "Note moyenne" : "Note";
    }

    let musiques=[];

    data.forEach(d=>{
        const notes=getNotes(d,profil);
        if(notes.length===0) return;

        const avg=notes.reduce((a,b)=>a+b,0)/notes.length;

        musiques.push({
            titre:cleanValue(d.Titre),
            artiste:cleanValue(d.Artiste),
            annee:cleanValue(d.Annee),
            moyenne:avg,
            sexe:cleanValue(d.Sexe)
        });
    });

    musiques.sort((a,b)=>a.moyenne-b.moyenne);

    const total=musiques.length;

    let selected=[];
    let i=0;
    while(i<musiques.length && (i<10 || musiques[i].moyenne===musiques[9].moyenne)){
        selected.push(musiques[i]);
        i++;
    }

    let rank=total;
    let previousNote=null;

    selected.forEach((m,index)=>{
        if(m.moyenne!==previousNote){
            rank=total-index;
            previousNote=m.moyenne;
        }

        const tr=document.createElement("tr");
        color = getPastelSexeColor(m.sexe);
        tr.style.setProperty("--bs-table-bg", color);

        tr.innerHTML=`
            <td>${rank}</td>
            <td>${m.titre}</td>
            <td>${m.artiste}</td>
            <td>${m.annee}</td>
            <td>${m.moyenne.toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ===============================
// Créer les graphes pour un profil
// ===============================
function createGraphsForProfile(profil, data) {
    console.log(`Création des graphiques pour le profil: ${profil}`);

    const ctxPieAnnee = document.getElementById(`graph_annee_${profil}`);
    if (ctxPieAnnee) {
        console.log("Création graphique Répartition Année");
        graphRepartitionAnnee(ctxPieAnnee.getContext('2d'), data, profil);
    }

    const ctxBarAnnee = document.getElementById(`graph_moyenne_annee_${profil}`);
    if (ctxBarAnnee) {
        console.log("Création graphique Moyenne Année");
        graphMoyenneParAnnee(ctxBarAnnee.getContext('2d'), data, profil);
    }

    const ctxPieSexe = document.getElementById(`graph_sexe_${profil}`);
    if (ctxPieSexe) {
        console.log("Création graphique Répartition Sexe");
        graphRepartitionSexe(ctxPieSexe.getContext('2d'), data, profil);
    }

    const ctxBarSexe = document.getElementById(`graph_moyenne_sexe_${profil}`);
    if (ctxBarSexe) {
        console.log("Création graphique Moyenne Sexe");
        graphMoyenneParSexe(ctxBarSexe.getContext('2d'), data, profil);
    }

    const ctxBarEpisode = document.getElementById(`graph_moyenne_episode_${profil}`);
    if (ctxBarEpisode) {
        console.log("Création graphique Moyenne Épisode");
        graphMoyenneParEpisode(ctxBarEpisode.getContext('2d'), data, profil);
    }

    const ctxBarNumero = document.getElementById(`graph_moyenne_numero_${profil}`);
    if (ctxBarNumero) {
        console.log("Création graphique Moyenne Numéro");
        graphMoyenneParNumero(ctxBarNumero.getContext('2d'), data, profil);
    }

    // Ajouter la suite de X ici pour les autres graphes...
}

function createTablesForProfile(profil, data){
    fillTopArtistes(`table_top_artistes_${profil}`, data, profil, document.getElementById(`filter_artistes_top_${profil}`)?.checked);
    fillBottomArtistes(`table_bottom_artistes_${profil}`, data, profil, document.getElementById(`filter_artistes_bottom_${profil}`)?.checked);
    fillTopMusiques(`table_top_chansons_${profil}`, data, profil);
    fillBottomMusiques(`table_bottom_chansons_${profil}`, data, profil);

    // Ajouter événements checkbox pour filtrer artistes
    const topCheckboxFil = document.getElementById(`filter_artistes_top_${profil}`);
    if(topCheckboxFil){
        topCheckboxFil.onchange = ()=> fillTopArtistes(`table_top_artistes_${profil}`, data, profil, topCheckboxFil.checked);
    }

    const bottomCheckboxFil = document.getElementById(`filter_artistes_bottom_${profil}`);
    if(bottomCheckboxFil){
        bottomCheckboxFil.onchange = ()=> fillBottomArtistes(`table_bottom_artistes_${profil}`, data, profil, bottomCheckboxFil.checked);
    }

    const topCheckboxGrp = document.getElementById(`group_artistes_top_${profil}`);
    if(topCheckboxGrp){
        topCheckboxGrp.onchange = ()=> fillTopArtistes(`table_top_artistes_${profil}`, data, profil, topCheckboxGrp.checked);
    }

    const bottomCheckboxGrp = document.getElementById(`group_artistes_bottom_${profil}`);
    if(bottomCheckboxGrp){
        bottomCheckboxGrp.onchange = ()=> fillBottomArtistes(`table_bottom_artistes_${profil}`, data, profil, bottomCheckboxGrp.checked);
    }
}

// ===============================
// Chargement du CSV et lancement
// ===============================
window.onload = function() {
    d3.csv("data/table_xxl.csv").then(function(data) {
        csvData = data; // stocker globalement pour showPage

        // Afficher la page Moyenne par défaut
        showPage("Moyenne");
    }).catch(function(error) {
        console.error("Erreur lors du chargement du CSV :", error);
    });
};































