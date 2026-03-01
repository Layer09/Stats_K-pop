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
        case "Fille": return "#FFB6C1";      // rose pastel
        case "Gars": return "#ADD8E6";       // bleu clair pastel
        case "Mixte": return "#D8BFD8";      // violet pastel
        case "Non renseigné": return "#4B6C9E"; // bleu foncé pastel
        default: return "#CCCCCC";
    }
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
    if (chartInstances[`pie_${profil}`]) chartInstances[`pie_${profil}`].destroy();

    chartInstances[`pie_${profil}`] = new Chart(ctx, {
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
        let notes = [];

        if (profil === "Moyenne") {
            ["Laurana","Andy","Anna","Gwenola","Melyssa"].forEach(jure => {
                const n1 = parseFloat(d[`Note_1_${jure}`]);
                const n2 = parseFloat(d[`Note_2_${jure}`]);
                if (!isNaN(n1)) notes.push(n1);
                if (!isNaN(n2)) notes.push(n2);
            });
        } else {
            const n1 = parseFloat(d[`Note_1_${profil}`]);
            const n2 = parseFloat(d[`Note_2_${profil}`]);
            if (!isNaN(n1)) notes.push(n1);
            if (!isNaN(n2)) notes.push(n2);
        }

        if (notes.length > 0) {
            sums[sexe] += notes.reduce((a,b) => a+b, 0) / notes.length;
            counts[sexe] += 1;
        }
    });

    const averages = Object.keys(sums).map(k => counts[k] > 0 ? sums[k]/counts[k] : 0);

    // Détruire le chart précédent si nécessaire
    if (chartInstances[`bar_${profil}`]) chartInstances[`bar_${profil}`].destroy();

    // Forcer le canvas à recalculer sa taille
    ctx.canvas.parentNode.style.position = 'relative';
    ctx.canvas.style.width = '100%';
    ctx.canvas.style.height = '300px';
    ctx.canvas.width = ctx.canvas.offsetWidth;
    ctx.canvas.height = ctx.canvas.offsetHeight;

    chartInstances[`bar_${profil}`] = new Chart(ctx, {
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

// Table: 10 meilleurs artistes
function graphTopArtistes(ctx, data, profil, minOccur=false) {
    const artistStats = {};

    data.forEach(d => {
        const artiste = cleanValue(d.Artiste);
        const sexe = cleanValue(d.Sexe);
        let notes = [];

        if (profil === "Moyenne") {
            ["Laurana","Andy","Anna","Gwenola","Melyssa"].forEach(jure => {
                const n1 = parseFloat(d[`Note_1_${jure}`]);
                const n2 = parseFloat(d[`Note_2_${jure}`]);
                if (!isNaN(n1)) notes.push(n1);
                if (!isNaN(n2)) notes.push(n2);
            });
        } else {
            const n1 = parseFloat(d[`Note_1_${profil}`]);
            const n2 = parseFloat(d[`Note_2_${profil}`]);
            if (!isNaN(n1)) notes.push(n1);
            if (!isNaN(n2)) notes.push(n2);
        }

        if (notes.length > 0) {
            if (!artistStats[artiste]) artistStats[artiste] = { sum: 0, count: 0, sexe: sexe };
            artistStats[artiste].sum += notes.reduce((a,b)=>a+b,0)/notes.length;
            artistStats[artiste].count += 1;
        }
    });

    // Si checkbox activée, filtrer artistes avec <5 titres
    let filtered = Object.entries(artistStats)
        .filter(([a, stats]) => !minOccur || stats.count >= 5);

    // Trier par moyenne décroissante
    filtered.sort((a,b) => b[1].sum/b[1].count - a[1].sum/a[1].count);

    // Prendre top 10
    const top = filtered.slice(0,10);

    const labels = top.map(([a, stats], idx) => `${idx+1}. ${a}`);
    const dataValues = top.map(([a, stats]) => +(stats.sum/stats.count).toFixed(2));
    const backgroundColors = top.map(([a, stats]) => getPastelSexeColor(stats.sexe));

    if(chartInstances[`topArt_${profil}`]) chartInstances[`topArt_${profil}`].destroy();

    chartInstances[`topArt_${profil}`] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: "Moyenne",
                data: dataValues,
                backgroundColor: backgroundColors
            }]
        },
        options: {
            indexAxis: 'y', // barre horizontale
            responsive: true,
            animation: { duration: 800, easing: 'easeOutCubic', from: 0 },
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { beginAtZero: true, max: 10 } }
        }
    });
}

// Table : 10 artistes moins appréciés
function graphBottomArtistes(ctx, data, profil, minOccur=false) {
    const artistStats = {};

    data.forEach(d => {
        const artiste = cleanValue(d.Artiste);
        const sexe = cleanValue(d.Sexe);
        let notes = [];

        if (profil === "Moyenne") {
            ["Laurana","Andy","Anna","Gwenola","Melyssa"].forEach(jure => {
                const n1 = parseFloat(d[`Note_1_${jure}`]);
                const n2 = parseFloat(d[`Note_2_${jure}`]);
                if (!isNaN(n1)) notes.push(n1);
                if (!isNaN(n2)) notes.push(n2);
            });
        } else {
            const n1 = parseFloat(d[`Note_1_${profil}`]);
            const n2 = parseFloat(d[`Note_2_${profil}`]);
            if (!isNaN(n1)) notes.push(n1);
            if (!isNaN(n2)) notes.push(n2);
        }

        if (notes.length > 0) {
            if (!artistStats[artiste]) artistStats[artiste] = { sum: 0, count: 0, sexe: sexe };
            artistStats[artiste].sum += notes.reduce((a,b)=>a+b,0)/notes.length;
            artistStats[artiste].count += 1;
        }
    });

    let filtered = Object.entries(artistStats)
        .filter(([a, stats]) => !minOccur || stats.count >= 5);

    // Trier par moyenne croissante
    filtered.sort((a,b) => a[1].sum/a[1].count - b[1].sum/b[1].count);

    const bottom = filtered.slice(0,10);

    const labels = bottom.map(([a, stats], idx) => `${idx+1}. ${a}`);
    const dataValues = bottom.map(([a, stats]) => +(stats.sum/stats.count).toFixed(2));
    const backgroundColors = bottom.map(([a, stats]) => getPastelSexeColor(stats.sexe));

    if(chartInstances[`bottomArt_${profil}`]) chartInstances[`bottomArt_${profil}`].destroy();

    chartInstances[`bottomArt_${profil}`] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: "Moyenne",
                data: dataValues,
                backgroundColor: backgroundColors
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            animation: { duration: 800, easing: 'easeOutCubic', from: 0 },
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { beginAtZero: true, max: 10 } }
        }
    });
}

// Table: Meilleures musiques
function graphTopMusiques(ctx, data, profil) {
    let musiques = [];

    data.forEach(d => {
        const notes = [];
        if(profil==="Moyenne") {
            ["Laurana","Andy","Anna","Gwenola","Melyssa"].forEach(jure=>{
                const n1=parseFloat(d[`Note_1_${jure}`]);
                const n2=parseFloat(d[`Note_2_${jure}`]);
                if(!isNaN(n1)) notes.push(n1);
                if(!isNaN(n2)) notes.push(n2);
            });
        } else {
            const n1=parseFloat(d[`Note_1_${profil}`]);
            const n2=parseFloat(d[`Note_2_${profil}`]);
            if(!isNaN(n1)) notes.push(n1);
            if(!isNaN(n2)) notes.push(n2);
        }

        if(notes.length>0){
            const moyenne = notes.reduce((a,b)=>a+b,0)/notes.length;
            musiques.push({
                titre: cleanValue(d.Titre),
                artiste: cleanValue(d.Artiste),
                annee: cleanValue(d.Annee),
                moyenne: moyenne,
                sexe: cleanValue(d.Sexe)
            });
        }
    });

    // Trier décroissant
    musiques.sort((a,b)=>b.moyenne - a.moyenne);

    let top = [];
    if(profil==="Moyenne"){
        // Top 10 ou plus si égalité
        let i=0;
        while(i<musiques.length && (i<10 || musiques[i].moyenne===musiques[9].moyenne)){
            top.push(musiques[i]);
            i++;
        }
    } else {
        // Profils individuels : toutes les musiques à 10/10
        top = musiques.filter(m=>m.moyenne===10);
    }

    const labels = top.map((m,idx)=>`${idx+1}. ${m.titre} (${m.artiste})`);
    const dataValues = top.map(m=>m.moyenne);
    const backgroundColors = top.map(m=>getPastelSexeColor(m.sexe));

    if(chartInstances[`topMus_${profil}`]) chartInstances[`topMus_${profil}`].destroy();

    chartInstances[`topMus_${profil}`] = new Chart(ctx,{
        type:'bar',
        data:{
            labels:labels,
            datasets:[{label:'Note moyenne',data:dataValues,backgroundColor:backgroundColors}]
        },
        options:{
            indexAxis:'y',
            responsive:true,
            animation:{duration:800,easing:'easeOutCubic',from:0},
            maintainAspectRatio:false,
            plugins:{legend:{display:false}},
            scales:{x:{beginAtZero:true,max:10}}
        }
    });
}

// Table: Pire musiques
function graphBottomMusiques(ctx, data, profil) {
    let musiques = [];

    data.forEach(d => {
        const notes = [];
        if(profil==="Moyenne") {
            ["Laurana","Andy","Anna","Gwenola","Melyssa"].forEach(jure=>{
                const n1=parseFloat(d[`Note_1_${jure}`]);
                const n2=parseFloat(d[`Note_2_${jure}`]);
                if(!isNaN(n1)) notes.push(n1);
                if(!isNaN(n2)) notes.push(n2);
            });
        } else {
            const n1=parseFloat(d[`Note_1_${profil}`]);
            const n2=parseFloat(d[`Note_2_${profil}`]);
            if(!isNaN(n1)) notes.push(n1);
            if(!isNaN(n2)) notes.push(n2);
        }

        if(notes.length>0){
            const moyenne = notes.reduce((a,b)=>a+b,0)/notes.length;
            musiques.push({
                titre: cleanValue(d.Titre),
                artiste: cleanValue(d.Artiste),
                annee: cleanValue(d.Annee),
                moyenne: moyenne,
                sexe: cleanValue(d.Sexe)
            });
        }
    });

    // Trier croissant
    musiques.sort((a,b)=>a.moyenne - b.moyenne);

    let bottom = [];
    let i=0;
    while(i<musiques.length && (i<10 || musiques[i].moyenne===musiques[9].moyenne)){
        bottom.push(musiques[i]);
        i++;
    }

    const labels = bottom.map((m,idx)=>`${idx+1}. ${m.titre} (${m.artiste})`);
    const dataValues = bottom.map(m=>m.moyenne);
    const backgroundColors = bottom.map(m=>getPastelSexeColor(m.sexe));

    if(chartInstances[`bottomMus_${profil}`]) chartInstances[`bottomMus_${profil}`].destroy();

    chartInstances[`bottomMus_${profil}`] = new Chart(ctx,{
        type:'bar',
        data:{
            labels:labels,
            datasets:[{label:'Note moyenne',data:dataValues,backgroundColor:backgroundColors}]
        },
        options:{
            indexAxis:'y',
            responsive:true,
            animation:{duration:800,easing:'easeOutCubic',from:0},
            maintainAspectRatio:false,
            plugins:{legend:{display:false}},
            scales:{x:{beginAtZero:true,max:10}}
        }
    });
}

// ===============================
// Créer les graphes pour un profil
// ===============================
function createGraphsForProfile(profil, data) {
    const ctxPie = document.getElementById(`graph_sexe_${profil}`);
    if (ctxPie) graphRepartitionSexe(ctxPie.getContext('2d'), data, profil);

    const ctxBar = document.getElementById(`graph_moyenne_sexe_${profil}`);
    if (ctxBar) graphMoyenneParSexe(ctxBar.getContext('2d'), data, profil);

    // ajouter la suite de X ici pour les autres graphes...
}

function createArtistAndMusicGraphs(profil, data) {
    const ctxTopArt = document.getElementById(`graph_top_artistes_${profil}`);
    const ctxBottomArt = document.getElementById(`graph_bottom_artistes_${profil}`);
    const ctxTopMus = document.getElementById(`graph_top_musiques_${profil}`);
    const ctxBottomMus = document.getElementById(`graph_bottom_musiques_${profil}`);

    const checkboxTop = document.getElementById(`checkbox_min_occur_${profil}`);
    const minOccur = checkboxTop ? checkboxTop.checked : false;

    if(ctxTopArt) graphTopArtistes(ctxTopArt.getContext('2d'), data, profil, minOccur);
    if(ctxBottomArt) graphBottomArtistes(ctxBottomArt.getContext('2d'), data, profil, minOccur);
    if(ctxTopMus) graphTopMusiques(ctxTopMus.getContext('2d'), data, profil);
    if(ctxBottomMus) graphBottomMusiques(ctxBottomMus.getContext('2d'), data, profil);

    // Recalculer si checkbox change
    if(checkboxTop){
        checkboxTop.onchange = ()=> createArtistAndMusicGraphs(profil, data);
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



