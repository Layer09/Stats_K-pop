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
        // CONFIGURATION GLOBALE
        // ===============================
        
        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' }
            }
        };
        
        function cleanValue(value) {
            return (value === null || value === undefined || value === "")
                ? "Non renseigné"
                : value;
        }
        
        function generateColors(count) {
            const colors = [];
            for (let i = 0; i < count; i++) {
                const hue = Math.floor((360 / count) * i);
                colors.push(`hsl(${hue},70%,60%)`);
            }
            return colors;
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
        // NIVEAU 1
        // ===============================
        
        // 1. Répartition par artiste
        function graphRepartitionArtistes(ctx, data) {
            const counts = {};
            data.forEach(d => {
                const val = cleanValue(d.Artiste);
                counts[val] = (counts[val] || 0) + 1;
            });
        
            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: Object.keys(counts),
                    datasets: [{
                        data: Object.values(counts),
                        backgroundColor: generateColors(Object.keys(counts).length)
                    }]
                },
                options: defaultOptions
            });
        }
        
        // 2. Répartition par génération
        function graphRepartitionGeneration(ctx, data) {
            const counts = {};
            data.forEach(d => {
                const val = cleanValue(d.Generation);
                counts[val] = (counts[val] || 0) + 1;
            });
        
            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: Object.keys(counts),
                    datasets: [{
                        data: Object.values(counts),
                        backgroundColor: generateColors(Object.keys(counts).length)
                    }]
                },
                options: defaultOptions
            });
        }
        
        // 3. Répartition par compagnie
        function graphRepartitionCompagnie(ctx, data) {
            const counts = {};
            data.forEach(d => {
                const val = cleanValue(d.Compagnie);
                counts[val] = (counts[val] || 0) + 1;
            });
        
            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: Object.keys(counts),
                    datasets: [{
                        data: Object.values(counts),
                        backgroundColor: generateColors(Object.keys(counts).length)
                    }]
                },
                options: defaultOptions
            });
        }
        
        // 4. Répartition par sexe
        function graphRepartitionSexe(ctx, data) {
            const counts = {};
            data.forEach(d => {
                const val = cleanValue(d.Sexe);
                counts[val] = (counts[val] || 0) + 1;
            });
        
            const labels = Object.keys(counts);
        
            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: Object.values(counts),
                        backgroundColor: labels.map(l => getSexeColor(l))
                    }]
                },
                options: defaultOptions
            });
        }
        
        // 5. Répartition par taille
        function graphRepartitionTaille(ctx, data) {
            const counts = {};
            data.forEach(d => {
                const val = cleanValue(d.Taille);
                counts[val] = (counts[val] || 0) + 1;
            });
        
            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: Object.keys(counts),
                    datasets: [{
                        data: Object.values(counts),
                        backgroundColor: generateColors(Object.keys(counts).length)
                    }]
                },
                options: defaultOptions
            });
        }
        
        // 6. Répartition par type
        function graphRepartitionType(ctx, data) {
            const counts = {};
            data.forEach(d => {
                const val = cleanValue(d.Type);
                counts[val] = (counts[val] || 0) + 1;
            });
        
            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: Object.keys(counts),
                    datasets: [{
                        data: Object.values(counts),
                        backgroundColor: generateColors(Object.keys(counts).length)
                    }]
                },
                options: defaultOptions
            });
        }
        
        // 7. Nombre de musiques par année
        function graphNombreParAnnee(ctx, data) {
            const counts = {};
            data.forEach(d => {
                const val = cleanValue(d.Annee);
                counts[val] = (counts[val] || 0) + 1;
            });
        
            const sorted = Object.keys(counts).sort();
        
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: sorted,
                    datasets: [{
                        label: "Nombre de musiques",
                        data: sorted.map(y => counts[y]),
                        backgroundColor: "#36A2EB"
                    }]
                },
                options: defaultOptions
            });
        }
        
        // =====================================================
        // NIVEAU 2 — ANALYSES COMPARATIVES
        // =====================================================
        
        // Liste des colonnes de notes
        const noteFields = [
            "Note_1_Andy", "Note_2_Andy",
            "Note_1_Anna",
            "Note_1_Gwenola",
            "Note_1_Laurana", "Note_2_Laurana",
            "Note_1_Melyssa", "Note_2_Melyssa"
        ];
        
        // Fonction moyenne globale d’une ligne
        function moyenneLigne(d) {
            let total = 0;
            let count = 0;
        
            noteFields.forEach(field => {
                const val = parseFloat(d[field]);
                if (!isNaN(val)) {
                    total += val;
                    count++;
                }
            });
        
            return count > 0 ? total / count : 0;
        }
        
        // ===============================
        // 1. Moyenne par génération
        // ===============================
        function graphMoyenneParGeneration(ctx, data) {
        
            const stats = {};
        
            data.forEach(d => {
                const gen = cleanValue(d.Generation);
                const moyenne = moyenneLigne(d);
        
                if (!stats[gen]) stats[gen] = { total: 0, count: 0 };
        
                stats[gen].total += moyenne;
                stats[gen].count++;
            });
        
            const labels = Object.keys(stats);
        
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Moyenne",
                        data: labels.map(l => stats[l].total / stats[l].count),
                        backgroundColor: generateColors(labels.length)
                    }]
                },
                options: defaultOptions
            });
        }
        
        // ===============================
        // 2. Moyenne par sexe
        // ===============================
        function graphMoyenneParSexe(ctx, data) {
        
            const stats = {};
        
            data.forEach(d => {
                const sexe = cleanValue(d.Sexe);
                const moyenne = moyenneLigne(d);
        
                if (!stats[sexe]) stats[sexe] = { total: 0, count: 0 };
        
                stats[sexe].total += moyenne;
                stats[sexe].count++;
            });
        
            const labels = Object.keys(stats);
        
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Moyenne",
                        data: labels.map(l => stats[l].total / stats[l].count),
                        backgroundColor: labels.map(l => getSexeColor(l))
                    }]
                },
                options: defaultOptions
            });
        }
        
        // ===============================
        // 3. Moyenne par type
        // ===============================
        function graphMoyenneParType(ctx, data) {
        
            const stats = {};
        
            data.forEach(d => {
                const type = cleanValue(d.Type);
                const moyenne = moyenneLigne(d);
        
                if (!stats[type]) stats[type] = { total: 0, count: 0 };
        
                stats[type].total += moyenne;
                stats[type].count++;
            });
        
            const labels = Object.keys(stats);
        
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Moyenne",
                        data: labels.map(l => stats[l].total / stats[l].count),
                        backgroundColor: generateColors(labels.length)
                    }]
                },
                options: defaultOptions
            });
        }
        
        // ===============================
        // 4. Evolution moyenne par année
        // ===============================
        function graphEvolutionAnnee(ctx, data) {
        
            const stats = {};
        
            data.forEach(d => {
                const annee = cleanValue(d.Annee);
                const moyenne = moyenneLigne(d);
        
                if (!stats[annee]) stats[annee] = { total: 0, count: 0 };
        
                stats[annee].total += moyenne;
                stats[annee].count++;
            });
        
            const sortedYears = Object.keys(stats).sort();
        
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: sortedYears,
                    datasets: [{
                        label: "Moyenne annuelle",
                        data: sortedYears.map(y => stats[y].total / stats[y].count),
                        borderColor: "#36A2EB",
                        tension: 0.3,
                        fill: false
                    }]
                },
                options: defaultOptions
            });
        }
        
        // ===============================
        // 5. Evolution par génération
        // ===============================
        function graphEvolutionGeneration(ctx, data) {
        
            const stats = {};
        
            data.forEach(d => {
                const annee = cleanValue(d.Annee);
                const gen = cleanValue(d.Generation);
                const moyenne = moyenneLigne(d);
        
                if (!stats[gen]) stats[gen] = {};
                if (!stats[gen][annee]) stats[gen][annee] = { total: 0, count: 0 };
        
                stats[gen][annee].total += moyenne;
                stats[gen][annee].count++;
            });
        
            const allYears = [...new Set(data.map(d => cleanValue(d.Annee)))].sort();
        
            const datasets = Object.keys(stats).map(gen => ({
                label: "Gen " + gen,
                data: allYears.map(year => {
                    const entry = stats[gen][year];
                    return entry ? entry.total / entry.count : null;
                }),
                borderColor: generateColors(Object.keys(stats).length)[Object.keys(stats).indexOf(gen)],
                tension: 0.3,
                fill: false
            }));
        
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: allYears,
                    datasets: datasets
                },
                options: defaultOptions
            });
        }
        
        // ===============================
        // 6. Evolution par sexe
        // ===============================
        function graphEvolutionSexe(ctx, data) {
        
            const stats = {};
        
            data.forEach(d => {
                const annee = cleanValue(d.Annee);
                const sexe = cleanValue(d.Sexe);
                const moyenne = moyenneLigne(d);
        
                if (!stats[sexe]) stats[sexe] = {};
                if (!stats[sexe][annee]) stats[sexe][annee] = { total: 0, count: 0 };
        
                stats[sexe][annee].total += moyenne;
                stats[sexe][annee].count++;
            });
        
            const allYears = [...new Set(data.map(d => cleanValue(d.Annee)))].sort();
        
            const datasets = Object.keys(stats).map(sexe => ({
                label: sexe,
                data: allYears.map(year => {
                    const entry = stats[sexe][year];
                    return entry ? entry.total / entry.count : null;
                }),
                borderColor: getSexeColor(sexe),
                tension: 0.3,
                fill: false
            }));
        
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: allYears,
                    datasets: datasets
                },
                options: defaultOptions
            });
        }
        
        // ===============================
        // 7. Evolution par juré
        // ===============================
        function graphEvolutionJures(ctx, data) {
        
            const jures = [...new Set(noteFields.map(n => n.split("_")[2]))];
        
            const years = [...new Set(data.map(d => cleanValue(d.Annee)))].sort();
        
            const datasets = jures.map(jure => {
        
                const yearlyStats = {};
        
                data.forEach(d => {
                    const annee = cleanValue(d.Annee);
        
                    const notes = noteFields.filter(n => n.includes(jure));
        
                    notes.forEach(field => {
                        const val = parseFloat(d[field]);
                        if (!isNaN(val)) {
                            if (!yearlyStats[annee]) yearlyStats[annee] = { total: 0, count: 0 };
                            yearlyStats[annee].total += val;
                            yearlyStats[annee].count++;
                        }
                    });
                });
        
                return {
                    label: jure,
                    data: years.map(year => {
                        const entry = yearlyStats[year];
                        return entry ? entry.total / entry.count : null;
                    }),
                    borderColor: generateColors(jures.length)[jures.indexOf(jure)],
                    tension: 0.3,
                    fill: false
                };
            });
        
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: years,
                    datasets: datasets
                },
                options: defaultOptions
            });
        }
        
        // =====================================================
        // NIVEAU 3 — ANALYSES CROISÉES & CLASSEMENTS
        // =====================================================
        
        // ===============================
        // 1. Moyenne par génération ET sexe
        // ===============================
        function graphGenerationSexe(ctx, data) {
        
            const stats = {};
        
            data.forEach(d => {
                const gen = cleanValue(d.Generation);
                const sexe = cleanValue(d.Sexe);
                const moyenne = moyenneLigne(d);
        
                if (!stats[gen]) stats[gen] = {};
                if (!stats[gen][sexe]) stats[gen][sexe] = { total: 0, count: 0 };
        
                stats[gen][sexe].total += moyenne;
                stats[gen][sexe].count++;
            });
        
            const generations = Object.keys(stats);
            const sexes = [...new Set(data.map(d => cleanValue(d.Sexe)))];
        
            const datasets = sexes.map(sexe => ({
                label: sexe,
                data: generations.map(gen => {
                    const entry = stats[gen][sexe];
                    return entry ? entry.total / entry.count : 0;
                }),
                backgroundColor: getSexeColor(sexe)
            }));
        
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: generations,
                    datasets: datasets
                },
                options: defaultOptions
            });
        }
        
        // ===============================
        // 2. Moyenne par compagnie ET génération
        // ===============================
        function graphCompagnieGeneration(ctx, data) {
        
            const stats = {};
        
            data.forEach(d => {
                const comp = cleanValue(d.Compagnie);
                const gen = cleanValue(d.Generation);
                const moyenne = moyenneLigne(d);
        
                if (!stats[comp]) stats[comp] = {};
                if (!stats[comp][gen]) stats[comp][gen] = { total: 0, count: 0 };
        
                stats[comp][gen].total += moyenne;
                stats[comp][gen].count++;
            });
        
            const compagnies = Object.keys(stats);
            const generations = [...new Set(data.map(d => cleanValue(d.Generation)))];
        
            const datasets = generations.map(gen => ({
                label: "Gen " + gen,
                data: compagnies.map(comp => {
                    const entry = stats[comp][gen];
                    return entry ? entry.total / entry.count : 0;
                }),
                backgroundColor: generateColors(generations.length)[generations.indexOf(gen)]
            }));
        
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: compagnies,
                    datasets: datasets
                },
                options: defaultOptions
            });
        }
        
        // ===============================
        // 3. Moyenne par artiste ET juré
        // ===============================
        function graphArtisteJure(ctx, data) {
        
            const artistes = [...new Set(data.map(d => cleanValue(d.Artiste)))];
            const jures = [...new Set(noteFields.map(n => n.split("_")[2]))];
        
            const datasets = jures.map(jure => {
        
                const stats = {};
        
                data.forEach(d => {
                    const artiste = cleanValue(d.Artiste);
                    const notes = noteFields.filter(n => n.includes(jure));
        
                    notes.forEach(field => {
                        const val = parseFloat(d[field]);
                        if (!isNaN(val)) {
                            if (!stats[artiste]) stats[artiste] = { total: 0, count: 0 };
                            stats[artiste].total += val;
                            stats[artiste].count++;
                        }
                    });
                });
        
                return {
                    label: jure,
                    data: artistes.map(a => {
                        const entry = stats[a];
                        return entry ? entry.total / entry.count : 0;
                    }),
                    backgroundColor: generateColors(jures.length)[jures.indexOf(jure)]
                };
            });
        
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: artistes,
                    datasets: datasets
                },
                options: defaultOptions
            });
        }
        
        // ===============================
        // 4. Moyenne par taille ET sexe
        // ===============================
        function graphTailleSexe(ctx, data) {
        
            const stats = {};
        
            data.forEach(d => {
                const taille = cleanValue(d.Taille);
                const sexe = cleanValue(d.Sexe);
                const moyenne = moyenneLigne(d);
        
                if (!stats[taille]) stats[taille] = {};
                if (!stats[taille][sexe]) stats[taille][sexe] = { total: 0, count: 0 };
        
                stats[taille][sexe].total += moyenne;
                stats[taille][sexe].count++;
            });
        
            const tailles = Object.keys(stats);
            const sexes = [...new Set(data.map(d => cleanValue(d.Sexe)))];
        
            const datasets = sexes.map(sexe => ({
                label: sexe,
                data: tailles.map(t => {
                    const entry = stats[t][sexe];
                    return entry ? entry.total / entry.count : 0;
                }),
                backgroundColor: getSexeColor(sexe)
            }));
        
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: tailles,
                    datasets: datasets
                },
                options: defaultOptions
            });
        }
        
        // ===============================
        // 5. Top 10 titres
        // ===============================
        function graphTop10(ctx, data) {
        
            const sorted = [...data]
                .map(d => ({
                    titre: cleanValue(d.Titre),
                    moyenne: moyenneLigne(d)
                }))
                .sort((a, b) => b.moyenne - a.moyenne)
                .slice(0, 10);
        
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: sorted.map(d => d.titre),
                    datasets: [{
                        label: "Top 10",
                        data: sorted.map(d => d.moyenne),
                        backgroundColor: "#4CAF50"
                    }]
                },
                options: defaultOptions
            });
        }
        
        // ===============================
        // 6. Bottom 10 titres
        // ===============================
        function graphBottom10(ctx, data) {
        
            const sorted = [...data]
                .map(d => ({
                    titre: cleanValue(d.Titre),
                    moyenne: moyenneLigne(d)
                }))
                .sort((a, b) => a.moyenne - b.moyenne)
                .slice(0, 10);
        
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: sorted.map(d => d.titre),
                    datasets: [{
                        label: "Bottom 10",
                        data: sorted.map(d => d.moyenne),
                        backgroundColor: "#E74C3C"
                    }]
                },
                options: defaultOptions
            });
        }
        
        // ===============================
        // 7. Distribution des notes (histogramme)
        // ===============================
        function graphDistributionNotes(ctx, data) {
        
            const distribution = {};
        
            data.forEach(d => {
                const moyenne = Math.round(moyenneLigne(d));
                distribution[moyenne] = (distribution[moyenne] || 0) + 1;
            });
        
            const labels = Object.keys(distribution).sort((a, b) => a - b);
        
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Distribution",
                        data: labels.map(l => distribution[l]),
                        backgroundColor: "#9B59B6"
                    }]
                },
                options: defaultOptions
            });
        }

        // =====================================================
        // NIVEAU 4 — ANALYSES EXPERT
        // =====================================================
        
        // ===============================
        // 1. Moyenne par artiste (menu déroulant)
        // ===============================
        function graphMoyenneParArtisteDropdown(ctx, data, selectedArtiste) {
        
            // Filtrer si un artiste est sélectionné
            const filtered = selectedArtiste === "Tous"
                ? data
                : data.filter(d => cleanValue(d.Artiste) === selectedArtiste);
        
            const stats = {};
        
            filtered.forEach(d => {
                const annee = cleanValue(d.Annee);
                const moyenne = moyenneLigne(d);
        
                if (!stats[annee]) stats[annee] = { total: 0, count: 0 };
                stats[annee].total += moyenne;
                stats[annee].count++;
            });
        
            const sortedYears = Object.keys(stats).sort();
        
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: sortedYears,
                    datasets: [{
                        label: selectedArtiste,
                        data: sortedYears.map(y => stats[y].total / stats[y].count),
                        borderColor: "#36A2EB",
                        tension: 0.3,
                        fill: false
                    }]
                },
                options: defaultOptions
            });
        }
        
        // ===============================
        // 2. Moyenne par sexe + multi-line par génération
        // ===============================
        function graphMoyenneSexeMulti(ctx, data) {
        
            const categories = ["Fille", "Gars", "Mixte", "Non renseigné"];
            const generations = [...new Set(data.map(d => cleanValue(d.Generation)))].sort();
        
            const stats = {};
        
            data.forEach(d => {
                const gen = cleanValue(d.Generation);
                const sexe = cleanValue(d.Sexe);
                const moyenne = moyenneLigne(d);
        
                if (!stats[sexe]) stats[sexe] = {};
                if (!stats[sexe][gen]) stats[sexe][gen] = { total: 0, count: 0 };
        
                stats[sexe][gen].total += moyenne;
                stats[sexe][gen].count++;
            });
        
            const datasets = categories.map(sexe => ({
                label: sexe,
                data: generations.map(gen => {
                    const entry = stats[sexe] && stats[sexe][gen];
                    return entry ? entry.total / entry.count : null;
                }),
                borderColor: getSexeColor(sexe),
                tension: 0.3,
                fill: false
            }));
        
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: generations,
                    datasets: datasets
                },
                options: defaultOptions
            });
        }
        
        // ===============================
        // 3. Moyenne par épisode
        // ===============================
        function graphMoyenneEpisode(ctx, data) {
        
            const stats = {};
        
            data.forEach(d => {
                const episode = cleanValue(d.Episode);
                const moyenne = moyenneLigne(d);
        
                if (!stats[episode]) stats[episode] = { total: 0, count: 0 };
                stats[episode].total += moyenne;
                stats[episode].count++;
            });
        
            const sortedEpisodes = Object.keys(stats).sort((a, b) => parseInt(a) - parseInt(b));
        
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: sortedEpisodes,
                    datasets: [{
                        label: "Moyenne par épisode",
                        data: sortedEpisodes.map(e => stats[e].total / stats[e].count),
                        borderColor: "#E67E22",
                        tension: 0.3,
                        fill: false
                    }]
                },
                options: defaultOptions
            });
        }
        
        // ===============================
        // 4. Génération dominante par artiste
        // ===============================
        function graphGenerationDominante(ctx, data) {
        
            const stats = {};
        
            data.forEach(d => {
                const artiste = cleanValue(d.Artiste);
                const gen = cleanValue(d.Generation);
        
                if (!stats[artiste]) stats[artiste] = {};
                stats[artiste][gen] = (stats[artiste][gen] || 0) + 1;
            });
        
            const artistes = Object.keys(stats);
            const genLabels = [...new Set(data.map(d => cleanValue(d.Generation)))];
        
            const datasets = genLabels.map(gen => ({
                label: "Gen " + gen,
                data: artistes.map(a => stats[a][gen] || 0),
                backgroundColor: generateColors(genLabels.length)
            }));
        
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: artistes,
                    datasets: datasets
                },
                options: defaultOptions
            });
        }
        
        // ===============================
        // 5. Moyenne cumulative par année
        // ===============================
        function graphMoyenneCumulative(ctx, data) {
        
            const years = [...new Set(data.map(d => cleanValue(d.Annee)))].sort();
            const cumMoyenne = [];
            let total = 0;
            let count = 0;
        
            years.forEach(year => {
                const entries = data.filter(d => cleanValue(d.Annee) === year);
                entries.forEach(d => {
                    const val = moyenneLigne(d);
                    total += val;
                    count++;
                });
                cumMoyenne.push(count ? total / count : 0);
            });
        
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: years,
                    datasets: [{
                        label: "Moyenne cumulative",
                        data: cumMoyenne,
                        borderColor: "#2ECC71",
                        tension: 0.3,
                        fill: false
                    }]
                },
                options: defaultOptions
            });
        }
        
        // ===============================
        // 6. Moyenne par type vidéo
        // ===============================
        function graphMoyenneTypeVideo(ctx, data) {
        
            const stats = {};
        
            data.forEach(d => {
                const type = cleanValue(d.Type_video);
                const moyenne = moyenneLigne(d);
        
                if (!stats[type]) stats[type] = { total: 0, count: 0 };
                stats[type].total += moyenne;
                stats[type].count++;
            });
        
            const labels = Object.keys(stats);
        
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Moyenne par type vidéo",
                        data: labels.map(l => stats[l].total / stats[l].count),
                        backgroundColor: generateColors(labels.length)
                    }]
                },
                options: defaultOptions
            });
        }
        
        // ===============================
        // 7. Moyenne par groupe (solo / groupe)
        // ===============================
        function graphMoyenneGroupe(ctx, data) {
        
            const stats = {};
        
            data.forEach(d => {
                const groupe = cleanValue(d.Groupe || d.Taille);
                const moyenne = moyenneLigne(d);
        
                if (!stats[groupe]) stats[groupe] = { total: 0, count: 0 };
                stats[groupe].total += moyenne;
                stats[groupe].count++;
            });
        
            const labels = Object.keys(stats);
        
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Moyenne par groupe",
                        data: labels.map(l => stats[l].total / stats[l].count),
                        backgroundColor: generateColors(labels.length)
                    }]
                },
                options: defaultOptions
            });
        }

        // ===============================
        // LANCEMENT
        // ===============================
        d3.csv("data/table_xxl.csv").then(function(data) {
        
            // ===================== NIVEAU 1 =====================
            createGraphsForProfile('Laurana', data);
            createGraphsForProfile('Andy', data);
            createGraphsForProfile('Anna', data);
            createGraphsForProfile('Melyssa', data);
            createGraphsForProfile('Gwenola', data);
            createMoyenneGraphs(data);
        
            // ===================== NIVEAU 2 =====================
            graphMoyenneParGeneration(document.getElementById('graph_moyenne_generation'), data);
            graphMoyenneParSexe(document.getElementById('graph_moyenne_sexe'), data);
            graphMoyenneParType(document.getElementById('graph_moyenne_type'), data);
            graphEvolutionParAnnee(document.getElementById('graph_evolution_annee'), data);
            graphEvolutionParGeneration(document.getElementById('graph_evolution_generation'), data);
            graphEvolutionParSexe(document.getElementById('graph_evolution_sexe'), data);
            graphEvolutionParJure(document.getElementById('graph_evolution_jure'), data);
        
            // ===================== NIVEAU 3 =====================
            graphGenerationSexe(document.getElementById('graph_generation_sexe'), data);
            graphCompagnieGeneration(document.getElementById('graph_compagnie_generation'), data);
            graphArtisteJure(document.getElementById('graph_artiste_jure'), data);
            graphTailleSexe(document.getElementById('graph_taille_sexe'), data);
            graphTop10Titres(document.getElementById('graph_top10'), data);
            graphBottom10Titres(document.getElementById('graph_bottom10'), data);
            graphDistributionNotes(document.getElementById('graph_distribution'), data);
        
            // ===================== NIVEAU 4 =====================
            graphMoyenneParArtisteDropdown(document.getElementById('graph_artiste_dropdown'), data, "Tous");
            graphMoyenneSexeMulti(document.getElementById('graph_moyenne_sexe_multi'), data);
            graphMoyenneParEpisode(document.getElementById('graph_moyenne_episode'), data);
            graphGenerationDominante(document.getElementById('graph_generation_dominante'), data);
            graphMoyenneCumulative(document.getElementById('graph_moyenne_cumulative'), data);
            graphMoyenneParTypeVideo(document.getElementById('graph_moyenne_type_video'), data);
            graphMoyenneParGroupe(document.getElementById('graph_moyenne_groupe'), data);
        
        });
        // Page affichée au démarrage
        showPage('Moyenne');

    }).catch(function (error) {
        console.error("Erreur lors du chargement du CSV :", error);
    });

};





