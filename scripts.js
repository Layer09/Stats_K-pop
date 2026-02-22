// Charger les données CSV
d3.csv("data/table_xxl.csv").then(function(data) {
    
    // Fonction pour créer un graphique en barre
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

    // Graphique des notes par Andy
    function createNoteGraph(data) {
        let notesAndy = data.map(d => d.Note_1_Andy);
        let ctx = document.getElementById('graph_notes_andy').getContext('2d');
        createBarChart(ctx, data.map(d => d.Artiste), notesAndy);
    }

    // Graphique des notes par Anna
    function createNoteAnnaGraph(data) {
        let notesAnna = data.map(d => d.Note_1_Anna);
        let ctx = document.getElementById('graph_notes_anna').getContext('2d');
        createBarChart(ctx, data.map(d => d.Artiste), notesAnna);
    }

    // Graphique des notes par Gwenola
    function createNoteGwenolaGraph(data) {
        let notesGwenola = data.map(d => d.Note_1_Gwenola);
        let ctx = document.getElementById('graph_notes_gwenola').getContext('2d');
        createBarChart(ctx, data.map(d => d.Artiste), notesGwenola);
    }

    // Moyenne des notes
    function createMoyenneGraph(data) {
        let moyenneNotes = data.map(d => (
            (parseFloat(d.Note_1_Andy) + parseFloat(d.Note_2_Andy) + parseFloat(d.Note_1_Anna) + parseFloat(d.Note_1_Gwenola)) / 4
        ));
        let ctx = document.getElementById('moyenne_graph').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.Annee),
                datasets: [{
                    label: 'Moyenne des Notes',
                    data: moyenneNotes,
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            }
        });
    }

    // Autres statistiques
    function createOtherGraph(data) {
        let noteCount = data.map(d => d.Note_1_Andy).length;
        let ctx = document.getElementById('other_graphs').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Notes Andy', 'Notes Anna', 'Notes Gwenola'],
                datasets: [{
                    data: [noteCount, noteCount, noteCount], // Par exemple
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                }]
            }
        });
    }

    // Afficher les graphiques
    createNoteGraph(data);
    createNoteAnnaGraph(data);
    createNoteGwenolaGraph(data);
    createMoyenneGraph(data);
    createOtherGraph(data);

    // Changer de page (pour les onglets)
    function showPage(page) {
        const pages = document.querySelectorAll('.page');
        pages.forEach(p => p.style.display = 'none');
        document.getElementById(page).style.display = 'block';
    }

    showPage('notes');  // Par défaut, afficher la page des notes
});