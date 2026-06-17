import fetch from 'node-fetch';

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const CACHE_URL = 'https://raw.githubusercontent.com/kmljkjj/discord-experiments-notifier/main/experiments.json';

async function fetchExperiments() {
  try {
    const res = await fetch('https://raw.githubusercontent.com/xHyroM/discord-datamining/master/data/client/experiments/experiments.json');
    const data = await res.json();
    return Array.isArray(data) ? data : (data.experiments || data || []);
  } catch (e) {
    console.error('Erreur fetch experiments:', e);
    return [];
  }
}

async function loadCache() {
  try {
    const res = await fetch(CACHE_URL);
    return await res.json();
  } catch {
    return { known: [] };
  }
}

async function main() {
  const currentExperiments = await fetchExperiments();
  const cache = await loadCache();

  const knownNames = new Set(cache.known || []);
  const newExperiments = currentExperiments.filter(exp => {
    const key = exp.name || exp.id;
    return key && !knownNames.has(key);
  });

  if (newExperiments.length > 0) {
    const embed = {
      title: "🧪 Nouvelles Expériences Discord !",
      color: 0x5865F2,
      description: `${newExperiments.length} nouvelle(s) expérience(s) détectée(s) !`,
      timestamp: new Date().toISOString(),
      fields: newExperiments.slice(0, 10).map(exp => ({
        name: exp.name || exp.id || 'Inconnue',
        value: `ID: ${exp.id || 'N/A'}\nType: ${exp.type || 'N/A'}`,
        inline: true
      })),
      footer: { text: 'Via GitHub Actions' }
    };

    if (WEBHOOK_URL) {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] })
      });
    }

    console.log('✅ Envoyé:', newExperiments.map(e => e.name || e.id));
  } else {
    console.log('✅ Aucune nouvelle.');
  }
}

main().catch(console.error);
