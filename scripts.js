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
        case "Fille": return "#FFB6C1";      // rose pastel
        case "Gars": return "#ADD8E6";       // bleu clair pastel
        case "Mixte": return "#D8BFD8";      // violet pastel
        case "Non renseigné": return "#4B6C9E"; // bleu foncé pastel
        default: return "#CCCCCC";
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

// Table : Top artistes
function fillTopArtistes(tableId,data,profil){

    const tbody=document.querySelector(`#${tableId} tbody`);
    tbody.innerHTML="";

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
        tr.style.backgroundColor=getPastelSexeColor(st.sexe);

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

    const tbody=document.querySelector(`#${tableId} tbody`);
    tbody.innerHTML="";

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
        tr.style.backgroundColor=getPastelSexeColor(st.sexe);

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

    const tbody=document.querySelector(`#${tableId} tbody`);
    tbody.innerHTML="";

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
        tr.style.backgroundColor=getPastelSexeColor(m.sexe);

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

    const tbody=document.querySelector(`#${tableId} tbody`);
    tbody.innerHTML="";

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
        tr.style.backgroundColor=getPastelSexeColor(m.sexe);

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
    const ctxPie = document.getElementById(`graph_sexe_${profil}`);
    if (ctxPie) graphRepartitionSexe(ctxPie.getContext('2d'), data, profil);

    const ctxBar = document.getElementById(`graph_moyenne_sexe_${profil}`);
    if (ctxBar) graphMoyenneParSexe(ctxBar.getContext('2d'), data, profil);

    // ajouter la suite de X ici pour les autres graphes...
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









