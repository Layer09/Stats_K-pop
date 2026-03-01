// ===============================
// Fonction pour afficher une page
// ===============================
function showPage(page) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById(page).classList.add('active');
}


// ===============================
// Chargement du CSV
// ===============================
window.onload = function () {

    d3.csv("data/table_xxl.csv").then(function (data) {

        console.log("Données CSV chargées :", data);


        // ===============================
        // CONFIGURATION COMMUNE CHART.JS
        // ===============================
        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: false
        };


        // ===============================
        // GRAPHIQUE BARRES (Notes)
        // ===============================
        function createBarChart(ctx, labels, dataValues) {

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Notes',
                        data: dataValues,
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: defaultOptions
            });
        }


        // ===============================
        // PIE ARTISTES
        // ===============================
        function createArtistesGraph(ctx, data) {

            let artistesCount = data.reduce((acc, d) => {
                acc[d.Artiste] = (acc[d.Artiste] || 0) + 1;
                return acc;
            }, {});

            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: Object.keys(artistesCount),
                    datasets: [{
                        data: Object.values(artistesCount),
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
                    }]
                },
                options: defaultOptions
            });
        }


        // ===============================
        // PIE COMPAGNIE
        // ===============================
        function createCompagnieGraph(ctx, data) {

            let compagnieCount = data.reduce((acc, d) => {
                acc[d.Compagnie] = (acc[d.Compagnie] || 0) + 1;
                return acc;
            }, {});

            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: Object.keys(compagnieCount),
                    datasets: [{
                        data: Object.values(compagnieCount),
                        backgroundColor: ['#FF9F40', '#4BC0C0', '#9966FF', '#FF6384']
                    }]
                },
                options: defaultOptions
            });
        }


        // ===============================
        // PIE SEXE
        // ===============================
        function createSexeGraph(ctx, data) {

            let sexeCount = data.reduce((acc, d) => {
                acc[d.Sexe] = (acc[d.Sexe] || 0) + 1;
                return acc;
            }, {});

            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: Object.keys(sexeCount),
                    datasets: [{
                        data: Object.values(sexeCount),
                        backgroundColor: ['#36A2EB', '#FF6384']
                    }]
                },
                options: defaultOptions
            });
        }


        // ===============================
        // GRAPHIQUES PAR PROFIL
        // ===============================
        function createGraphsForProfile(profile, data) {

            // Notes
            let ctxNotes = document.getElementById(`graph_notes_${profile}`);
            if (ctxNotes) {
                createBarChart(
                    ctxNotes.getContext('2d'),
                    data.map(d => d.Artiste),
                    data.map(d => parseFloat(d[`Note_1_${profile}`]) || 0)
                );
            }

            // Artistes
            let ctxArtistes = document.getElementById(`graph_artistes_${profile}`);
            if (ctxArtistes) {
                createArtistesGraph(ctxArtistes.getContext('2d'), data);
            }

            // Compagnie
            let ctxCompagnie = document.getElementById(`graph_compagnie_${profile}`);
            if (ctxCompagnie) {
                createCompagnieGraph(ctxCompagnie.getContext('2d'), data);
            }

            // Sexe
            let ctxSexe = document.getElementById(`graph_sexe_${profile}`);
            if (ctxSexe) {
                createSexeGraph(ctxSexe.getContext('2d'), data);
            }
        }


        // ===============================
        // GRAPHIQUES MOYENNE
        // ===============================
        function createMoyenneGraphs(data) {

            let moyenneNotes = data.map(d => (
                (
                    (parseFloat(d.Note_2_Laurana) || 0) +
                    (parseFloat(d.Note_2_Andy) || 0) +
                    (parseFloat(d.Note_1_Anna) || 0) +
                    (parseFloat(d.Note_2_Melyssa) || 0) +
                    (parseFloat(d.Note_1_Gwenola) || 0)
                ) / 5
            ));

            let ctxMoyenne = document.getElementById('moyenne_graph');
            if (ctxMoyenne) {
                createBarChart(
                    ctxMoyenne.getContext('2d'),
                    data.map(d => d.Annee),
                    moyenneNotes
                );
            }

            let ctxArtistesMoy = document.getElementById('graph_artistes_moyenne');
            if (ctxArtistesMoy) {
                createArtistesGraph(ctxArtistesMoy.getContext('2d'), data);
            }

            let ctxSexeMoy = document.getElementById('graph_sexe_moyenne');
            if (ctxSexeMoy) {
                createSexeGraph(ctxSexeMoy.getContext('2d'), data);
            }

            let ctxCompagnieMoy = document.getElementById('graph_compagnie_moyenne');
            if (ctxCompagnieMoy) {
                createCompagnieGraph(ctxCompagnieMoy.getContext('2d'), data);
            }
        }


        // ===============================
        // LANCEMENT
        // ===============================
        createGraphsForProfile('Laurana', data);
        createGraphsForProfile('Andy', data);
        createGraphsForProfile('Anna', data);
        createGraphsForProfile('Melyssa', data);
        createGraphsForProfile('Gwenola', data);

        createMoyenneGraphs(data);

        // Page affichée au démarrage
        showPage('Moyenne');

    }).catch(function (error) {
        console.error("Erreur lors du chargement du CSV :", error);
    });

};
