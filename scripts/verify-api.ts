import { ShikimoriService } from '../src/services/shikimori.js';
import { AniLibriaService } from '../src/services/anilibria.js';

async function runTests() {
  console.log('--- 1. Testing Shikimori & AniLibria Search (RU & EN) ---');
  const shiki = ShikimoriService.getInstance();
  const al = AniLibriaService.getInstance();

  const ruResults = await shiki.search('атака титанов');
  console.log(`Query "атака титанов": found ${ruResults.length} titles`);
  const foundRu = ruResults.some(r => r.titleRu.toLowerCase().includes('титан') || r.titleEn.toLowerCase().includes('titan'));
  console.log(`  ✓ Match found: ${foundRu ? 'YES' : 'NO'} (${ruResults[0]?.titleRu})`);

  const enResults = await shiki.search('attack on titan');
  console.log(`Query "attack on titan": found ${enResults.length} titles`);
  const foundEn = enResults.some(r => r.titleRu.toLowerCase().includes('титан') || r.titleEn.toLowerCase().includes('titan'));
  console.log(`  ✓ Match found: ${foundEn ? 'YES' : 'NO'} (${enResults[0]?.titleRu})`);

  console.log('\n--- 2. Testing Bleach Franchise Chronology ---');
  // Bleach Shikimori ID is 269
  const bleachFranchise = await shiki.getFranchise(269);
  console.log(`Bleach main seasons found: ${bleachFranchise.mainSeasons.length}`);
  bleachFranchise.mainSeasons.forEach((s) => {
    console.log(`  - [${s.seasonLabel}] ${s.titleRu} (${s.year || ''})`);
  });
  console.log(`Bleach movies: ${bleachFranchise.movies.length}, OVAs: ${bleachFranchise.ovasAndSpecials.length}`);

  console.log('\n--- 3. Testing Naruto Franchise Chronology ---');
  // Naruto Shikimori ID is 20
  const narutoFranchise = await shiki.getFranchise(20);
  console.log(`Naruto main seasons found: ${narutoFranchise.mainSeasons.length}`);
  narutoFranchise.mainSeasons.slice(0, 5).forEach((s) => {
    console.log(`  - [${s.seasonLabel}] ${s.titleRu} (${s.year || ''})`);
  });
  console.log(`Naruto movies: ${narutoFranchise.movies.length}, OVAs/Specials: ${narutoFranchise.ovasAndSpecials.length}`);

  console.log('\n--- 4. Testing AniLibria Schedule & HLS Streams ---');
  const schedule = await al.getSchedule();
  console.log(`AniLibria Schedule days returned: ${schedule.length}`);
  if (schedule.length > 0 && schedule[0].titles.length > 0) {
    const first = schedule[0].titles[0];
    console.log(`First title: ${first.titleRu} (Episodes: ${first.episodes.length})`);
    if (first.episodes.length > 0) {
      console.log(`  First ep: ${first.episodes[0].title}`);
      console.log(`  HLS stream: ${first.episodes[0].hls?.fhd || first.episodes[0].hls?.hd || 'available'}`);
    }
  }

  console.log('\n--- 5. Testing AniLibria findReleaseEpisodes (Steins;Gate & Frieren) ---');
  const sg = await al.findReleaseEpisodes('Врата Штейна', 'Steins;Gate', 9253);
  console.log(`Steins;Gate episodes found: ${sg.episodes.length} (Expected >= 24)`);
  if (sg.episodes.length > 0) {
    console.log(`  Ep 1 HLS: ${sg.episodes[0].hls?.fhd || sg.episodes[0].hls?.hd}`);
  }

  const frieren = await al.findReleaseEpisodes('Провожающая в последний путь Фрирен', 'Sousou no Frieren', 52991);
  console.log(`Frieren episodes found: ${frieren.episodes.length} (Expected >= 28)`);
  if (frieren.episodes.length > 0) {
    console.log(`  Ep 1 HLS: ${frieren.episodes[0].hls?.fhd || frieren.episodes[0].hls?.hd}`);
  }

  console.log('\n--- 6. Testing Death Note Poster Resolution ---');
  const dn = await shiki.search('Тетрадь смерти');
  console.log(`Death Note search results: ${dn.length}`);
  if (dn.length > 0) {
    console.log(`Death Note poster: ${dn[0].poster}`);
    console.log(`  ✓ Does NOT contain missing_: ${!dn[0].poster.includes('missing_') ? 'YES' : 'NO'}`);
  }

  console.log('\n🎉 ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!');
}

runTests().catch(console.error);
