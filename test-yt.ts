import { Innertube } from 'youtubei.js';

async function test() {
  try {
    const yt = await Innertube.create();
    const info = await yt.getBasicInfo('lYBUbBu4W08');
    const format = info.chooseFormat({ type: 'audio', quality: 'best' });
    console.log(format.decipher(yt.session.player));
  } catch (e) {
    console.error(e);
  }
}
test();
