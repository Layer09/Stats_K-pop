// ===============================
// Fonction pour afficher une page
// ===============================
function showPage(page) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById(page).classList.add('active');
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

    new Chart(ctx, {
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
                duration: 500,          // durée de l’animation en ms
                animateRotate: true,    // fait tourner le cercle
                animateScale: true      // fait apparaître en grandissant depuis le centre
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

    new Chart(ctx, {
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
                duration: 500,           // durée de l’animation en ms
                easing: 'easeOutCubic',  // effet de montée fluide
                from: 0                  // démarre les barres à 0
            },
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, max: 10 } }
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

// ===============================
// Chargement du CSV et lancement
// ===============================
window.onload = function() {
    d3.csv("data/table_xxl.csv").then(function(data) {

        // Graphes par juré
        ["Laurana","Andy","Anna","Melyssa","Gwenola"].forEach(profil => {
            createGraphsForProfile(profil, data);
        });

        // Graphes Moyenne
        createGraphsForProfile("Moyenne", data);

        // Afficher la page Moyenne par défaut
        showPage("Moyenne");

    }).catch(function(error) {
        console.error("Erreur lors du chargement du CSV :", error);
    });
};


