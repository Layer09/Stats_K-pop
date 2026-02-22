// Fonction pour afficher la page sélectionnée et masquer les autres
function showPage(page) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById(page).classList.add('active');
}

// Charger les données CSV
d3.csv("data/table_xxl.csv").then(function(data) {
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

    // Créer tous les graphiques pour Andy
    function createAndyGraphs(data) {
        let ctx1 = document.getElementById('graph_notes_andy')?.getContext('2d');
        if (ctx1) createBarChart(ctx1, data.map(d => d.Artiste), data.map(d => d.Note_1_Andy));

        let ctx2 = document.getElementById('graph_artistes_andy')?.getContext('2d');
        if (ctx2) createArtistesGraph(ctx2, data);

        let ctx3 = document.getElementById('graph_compagnie_andy')?.getContext('2d');
        if (ctx3) createCompagnieGraph(ctx3, data);

        let ctx4 = document.getElementById('graph_sexe_andy')?.getContext('2d');
        if (ctx4) createSexeGraph(ctx4, data);
    }

    // Créer tous les graphiques pour Laurana
    function createLauranaGraphs(data) {
        let ctx1 = document.getElementById('graph_notes_laurana')?.getContext('2d');
        if (ctx1) createBarChart(ctx1, data.map(d => d.Artiste), data.map(d => d.Note_1_Laurana));

        let ctx2 = document.getElementById('graph_artistes_laurana')?.getContext('2d');
        if (ctx2) createArtistesGraph(ctx2, data);

        let ctx3 = document.getElementById('graph_compagnie_laurana')?.getContext('2d');
        if (ctx3) createCompagnieGraph(ctx3, data);

        let ctx4 = document.getElementById('graph_sexe_laurana')?.getContext('2d');
        if (ctx4) createSexeGraph(ctx4, data);
    }

    // Créer tous les graphiques pour Anna
    function createAnnaGraphs(data) {
        let ctx1 = document.getElementById('graph_notes_anna')?.getContext('2d');
        if (ctx1) createBarChart(ctx1, data.map(d => d.Artiste), data.map(d => d.Note_1_Anna));

        let ctx2 = document.getElementById('graph_artistes_anna')?.getContext('2d');
        if (ctx2) createArtistesGraph(ctx2, data);

        let ctx3 = document.getElementById('graph_compagnie_anna')?.getContext('2d');
        if (ctx3) createCompagnieGraph(ctx3, data);

        let ctx4 = document.getElementById('graph_sexe_anna')?.getContext('2d');
        if (ctx4) createSexeGraph(ctx4, data);
    }

    // Créer tous les graphiques pour Gwenola
    function createGwenolaGraphs(data) {
        let ctx1 = document.getElementById('graph_notes_gwenola')?.getContext('2d');
        if (ctx1) createBarChart(ctx1, data.map(d => d.Artiste), data.map(d => d.Note_1_Gwenola));

        let ctx2 = document.getElementById('graph_artistes_gwenola')?.getContext('2d');
        if (ctx2) createArtistesGraph(ctx2, data);

        let ctx3 = document.getElementById('graph_compagnie_gwenola')?.getContext('2d');
        if (ctx3) createCompagnieGraph(ctx3, data);

        let ctx4 = document.getElementById('graph_sexe_gwenola')?.getContext('2d');
        if (ctx4) createSexeGraph(ctx4, data);
    }

    // Afficher la page de Moyenne au départ
    showPage('Moyenne');
});

