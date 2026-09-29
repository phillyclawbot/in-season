/**
 * Which flyer publishers count as "real" grocery stores.
 *
 * Flipp carries flyers from dollar stores, pharmacies, restaurant suppliers and
 * tiny independents too. We only want the big grocery chains whose prices are
 * worth comparing (and price-matching), so everything else is filtered out.
 * Add a pattern here to allow another chain.
 */
const MAJOR_GROCERS: RegExp[] = [
  /\bacme\b/i,
  /\balbertsons\b/i,
  /\baldi\b/i,
  /\bbig y\b/i,
  /\bbj'?s\b/i,
  /\bcostco\b/i,
  /\bcub foods?\b/i,
  /\bdillons\b/i,
  /\bfareway\b/i,
  /\bfestival foods\b/i,
  /\bfood 4 less\b/i,
  /\bfood bazaar\b/i,
  /\bfood lion\b/i,
  /\bfoodtown\b/i,
  /\bfred meyer\b/i,
  /\bfresh grocer\b/i,
  /\bfresh market\b/i,
  /\bfry'?s\b/i,
  /\bgiant\b/i, // Giant Food, Giant Food Stores, Giant Eagle, The Giant Company
  /\bgrocery outlet\b/i,
  /\bh mart\b|\bhmart\b/i,
  /\bh-?e-?b\b/i,
  /\bhannaford\b/i,
  /\bharris teeter\b/i,
  /\bhy-?vee\b/i,
  /\bingles\b/i,
  /\bjewel(-| )?osco\b/i,
  /\bkey food\b/i,
  /\bking soopers\b/i,
  /\bkroger\b/i,
  /\blidl\b/i,
  /\blucky\b/i,
  /\bmarket basket\b/i,
  /\bmeijer\b/i,
  /\bpiggly wiggly\b/i,
  /\bprice chopper\b/i,
  /\bprice ?rite\b/i,
  /\bpublix\b/i,
  /\braley'?s\b/i,
  /\bralphs\b/i,
  /\bredner'?s\b/i,
  /\bsafeway\b/i,
  /\bsam'?s club\b/i,
  /\bsave a lot\b|\bsave-a-lot\b/i,
  /\bschnucks\b/i,
  /\bshaw'?s\b/i,
  /\bshop ?rite\b/i,
  /\bsmith'?s\b/i,
  /\bsprouts\b/i,
  /\bstater bros\b/i,
  /\bstop & shop\b|\bstop and shop\b/i,
  /\btarget\b/i,
  /\btops\b/i,
  /\btrader joe'?s\b/i,
  /\bvons\b/i,
  /\bwalmart\b/i,
  /\bwegmans?'?s?\b/i,
  /\bweis\b/i,
  /\bwhole foods\b/i,
  /\bwinco\b/i,
  /\bwinn-?dixie\b/i,
  /\bwoodman'?s\b/i,
];

export function isMajorGrocer(merchantName: string): boolean {
  const name = merchantName.trim();
  return MAJOR_GROCERS.some((re) => re.test(name));
}
