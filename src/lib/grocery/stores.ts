/**
 * Which flyer publishers count as price-matchable grocery stores.
 *
 * Only full-line supermarkets and big-box grocers that sell national brands are
 * listed, so a flyer price here is for a product another major store also
 * carries and can match. Left out on purpose: warehouse clubs (membership and
 * bulk sizes), store-brand discounters (ALDI, Lidl, Trader Joe's), closeout and
 * specialty or natural grocers, dollar stores, pharmacies and restaurant suppliers.
 * Add a pattern here to allow another chain.
 */
const MAJOR_GROCERS: RegExp[] = [
  /\bacme\b/i,
  /\balbertsons\b/i,
  /\bbig y\b/i,
  /\bcub foods?\b/i,
  /\bdillons\b/i,
  /\bfareway\b/i,
  /\bfestival foods\b/i,
  /\bfood lion\b/i,
  /\bfoodtown\b/i,
  /\bfred meyer\b/i,
  /\bfresh grocer\b/i,
  /\bfry'?s\b/i,
  /\bgiant\b/i, // Giant Food, Giant Food Stores, Giant Eagle, The Giant Company
  /\bh-?e-?b\b/i,
  /\bhannaford\b/i,
  /\bharris teeter\b/i,
  /\bhy-?vee\b/i,
  /\bingles\b/i,
  /\bjewel(-| )?osco\b/i,
  /\bkey food\b/i,
  /\bking soopers\b/i,
  /\bkroger\b/i,
  /\blucky\b/i,
  /\bmarket basket\b/i,
  /\bmeijer\b/i,
  /\bpiggly wiggly\b/i,
  /\bprice chopper\b/i,
  /\bpublix\b/i,
  /\braley'?s\b/i,
  /\bralphs\b/i,
  /\bredner'?s\b/i,
  /\bsafeway\b/i,
  /\bschnucks\b/i,
  /\bshaw'?s\b/i,
  /\bshop ?rite\b/i,
  /\bsmith'?s\b/i,
  /\bstater bros\b/i,
  /\bstop & shop\b|\bstop and shop\b/i,
  /\btarget\b/i,
  /\btops\b/i,
  /\bvons\b/i,
  /\bwalmart\b/i,
  /\bwegmans?'?s?\b/i,
  /\bweis\b/i,
  /\bwinn-?dixie\b/i,
  /\bwoodman'?s\b/i,
];

export function isMajorGrocer(merchantName: string): boolean {
  const name = merchantName.trim();
  return MAJOR_GROCERS.some((re) => re.test(name));
}
