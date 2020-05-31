
function getImageUrls() {
  let str = 'const urls = {';
  let urls = {
      "cult_track": 'images/cult_track.jpg',
      'ACT1': 'images/src/action1.svg',
      'ACT2': 'images/src/action2.svg',
      'ACT3': 'images/src/action3.svg',
      'ACT4': 'images/src/action4.svg',
      'ACT5': 'images/src/action5.svg',
      'ACT6': 'images/src/action6.svg',
      'ACTTAKEN': 'images/src/action_taken.svg',
      'BON1': 'images/bonus01.png',
      'BON2': 'images/bonus02.png',
      'BON3': 'images/bonus03.png',
      'BON4': 'images/bonus04.png',
      'BON5': 'images/bonus05.png',
      'BON6': 'images/bonus06.png',
      'BON7': 'images/bonus07.png',
      'BON8': 'images/bonus08.png',
      'BON9': 'images/bonus09.png',
      "FAV1": 'images/favor01.png',
      "FAV2": 'images/favor02.png',
      "FAV3": 'images/favor03.png',
      "FAV4": 'images/favor04.png',
      "FAV5": 'images/favor05.png',
      "FAV6": 'images/favor06.png',
      "FAV7": 'images/favor07.png',
      "FAV8": 'images/favor08.png',
      "FAV9": 'images/favor09.png',
      "FAV10": 'images/favor10.png',
      "FAV11": 'images/favor11.png',
      "FAV12": 'images/favor12.png',
      "TW1": 'images/town1.png',
      "TW2": 'images/town2.png',
      "TW3": 'images/town3.png',
      "TW4": 'images/town4.png',
      "TW5": 'images/town5.png',
      'coin5': 'images/src/coin5.svg',
      'coin2': 'images/src/coin2.svg',
      'coin1': 'images/src/coin1.svg',
      'worker': 'images/src/worker.svg',
      'priest_green': 'images/src/priest_green.svg',
      'priest_yellow': 'images/src/priest_yellow.svg',
      'priest_blue': 'images/src/priest_blue.svg',
      'priest_brown': 'images/src/priest_brown.svg',
      'priest_red': 'images/src/priest_red.svg',
      'priest_black': 'images/src/priest_black.svg',
      'priest_gray': 'images/src/priest_gray.svg',
      'faction_alchemists': 'images/faction_alchemists.jpg',
      'faction_auren': 'images/faction_auren.jpg',
      'faction_chaosmagicians': 'images/faction_chaosmagicians.jpg',
      'faction_cultists': 'images/faction_cultists.jpg',
      'faction_darklings': 'images/faction_darklings.jpg',
      'faction_dwarves': 'images/faction_dwarves.jpg',
      'faction_engineers': 'images/faction_engineers.jpg',
      'faction_fakirs': 'images/faction_fakirs.jpg',
      'faction_giants': 'images/faction_giants.jpg',
      'faction_halflings': 'images/faction_halflings.jpg',
      'faction_mermaids': 'images/faction_mermaids.jpg',
      'faction_nomads': 'images/faction_nomads.jpg',
      'faction_swarmlings': 'images/faction_swarmlings.jpg',
      'faction_witches': 'images/faction_witches.jpg',
  };
  for (key in urls) {
    str += key + ': "' + browser.extension.getURL(urls[key]) + '", ';
  }
  str += '};'
  return str;
}

function overwriteFunctions(details) {
  console.log(details.url + " was requested")
  let filename = details.url.match(/[^/\.]*\.(js|css)/i)[0];
  console.log(filename);

  let filter = browser.webRequest.filterResponseData(details.requestId);
  let decoder = new TextDecoder("utf-8");
  let encoder = new TextEncoder();
  let enc;
  filter.ondata = async function(event) {

    // output the original content
    let orig_gamejs = decoder.decode(event.data, {stream: true});
    enc = encoder.encode(orig_gamejs);
    console.log('orig', enc);
    await filter.write(enc);

  };
  filter.onstop = async function(event) {

    if (filename == 'game.js') {
      // output the image urls
      let imgUrls = getImageUrls();
      enc = encoder.encode(imgUrls);
      console.log('urls', enc);
      await filter.write(enc);
    }

    // output the new content, which overwrites the original content
    let modified_gamejs;
    let path = 'content_scripts/' + filename;
    let response = await fetch(path, {mode:'same-origin'}) // <-- important
    let file = await response.blob();
    console.log('file', file);
    let reader = new FileReader();
    reader.onload = async function() {
      modified_gamejs = reader.result;
      let enc = encoder.encode(modified_gamejs);
      console.log('custom', enc);
      await filter.write(enc);
    };
    reader.onloadend = function() {

      // clean up
      filter.disconnect();
      console.log("finished parsing " + filename);

    }
    reader.readAsText(file);

  };
  // things here will happen while the filter is receiving data
  return {};
}

browser.webRequest.onBeforeRequest.addListener(
  overwriteFunctions,
  {
    urls: [
    "*://terra.snellman.net/stc/game.js*"
    ]
  },
  ["blocking"]
);

