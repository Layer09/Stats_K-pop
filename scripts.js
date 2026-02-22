// Fonction pour afficher la page sélectionnée et masquer les autres
function showPage(page) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById(page).classList.add('active');
}

// Charger les données CSV
window.onload = function() {
    d3.csv("data/table_xxl.csv").then(function(data) {
        console.log("Données CSV chargées avec succès", data); // Vérification du chargement des données

        // Fonction pour créer un graphique à barres
        function createBarChart(ctx, labels, data) {
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Notes',
                        data: data,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                }
            });
        }

        // Fonction pour créer un graphique des artistes (pie chart)
        function createArtistesGraph(ctx, data) {
            let artistesCount = data.reduce((acc, d) => {
                acc[d.Artiste] = (acc[d.Artiste] || 0) + 1;
                return acc;
            }, {});
            let labels = Object.keys(artistesCount);
            let values = Object.values(artistesCount);

            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF914D'],
                    }]
                }
            });
        }

        // Fonction pour créer un graphique des compagnies (pie chart)
        function createCompagnieGraph(ctx, data) {
            let compagnieCount = data.reduce((acc, d) => {
                acc[d.Compagnie] = (acc[d.Compagnie] || 0) + 1;
                return acc;
            }, {});
            let labels = Object.keys(compagnieCount);
            let values = Object.values(compagnieCount);

            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF914D'],
                    }]
                }
            });
        }

        // Fonction pour créer un graphique des sexes (pie chart)
        function createSexeGraph(ctx, data) {
            let sexeCount = data.reduce((acc, d) => {
                acc[d.Sexe] = (acc[d.Sexe] || 0) + 1;
                return acc;
            }, {});
            let labels = Object.keys(sexeCount);
            let values = Object.values(sexeCount);

            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: ['#FF6384', '#36A2EB'],
                    }]
                }
            });
        }

        // Créer les graphiques pour chaque profil
        function createGraphsForProfile(profile, data) {
            let ctx1 = document.getElementById(`graph_notes_${profile}`);
            if (ctx1) {
                ctx1 = ctx1.getContext('2d');
                createBarChart(ctx1, data.map(d => d.Artiste), data.map(d => d[`Note_1_${profile}`]));
            } else {
                console.error(`Graphique pour graph_notes_${profile} introuvable.`);
            }

            let ctx2 = document.getElementById(`graph_artistes_${profile}`);
            if (ctx2) {
                ctx2 = ctx2.getContext('2d');
                createArtistesGraph(ctx2, data);
            } else {
                console.error(`Graphique pour graph_artistes_${profile} introuvable.`);
            }

            let ctx3 = document.getElementById(`graph_compagnie_${profile}`);
            if (ctx3) {
                ctx3 = ctx3.getContext('2d');
                createCompagnieGraph(ctx3, data);
            } else {
                console.error(`Graphique pour graph_compagnie_${profile} introuvable.`);
            }

            let ctx4 = document.getElementById(`graph_sexe_${profile}`);
            if (ctx4) {
                ctx4 = ctx4.getContext('2d');
                createSexeGraph(ctx4, data);
            } else {
                console.error(`Graphique pour graph_sexe_${profile} introuvable.`);
            }
        }

        // Créer les graphiques pour la Moyenne
        function createMoyenneGraphs(data) {
            let moyenneNotes = data.map(d => (
                (parseFloat(d.Note_1_Andy) + parseFloat(d.Note_2_Andy) + parseFloat(d.Note_1_Anna) + parseFloat(d.Note_1_Gwenola)) / 4
            ));
            let ctx1 = document.getElementById('moyenne_graph').getContext('2d');
            createBarChart(ctx1, data.map(d => d.Annee), moyenneNotes);

            let ctx2 = document.getElementById('graph_artistes_moyenne').getContext('2d');
            createArtistesGraph(ctx2, data);

            let ctx3 = document.getElementById('graph_sexe_moyenne').getContext('2d');
            createSexeGraph(ctx3, data);
        }

        // Créer les graphiques pour tous les profils
        createGraphsForProfile('Andy', data);
        createGraphsForProfile('Laurana', data);
        createGraphsForProfile('Anna', data);
        createGraphsForProfile('Gwenola', data);

        // Créer les graphiques pour la Moyenne
        createMoyenneGraphs(data);

        // Afficher la page de Moyenne au départ
        showPage('Moyenne');
    }).catch(function(error) {
        console.error("Erreur lors du chargement du fichier CSV", error);
    });
}
