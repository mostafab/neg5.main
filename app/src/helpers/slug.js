import slug from 'slug';

const SLUG_MODE = 'rfc3986';

slug.defaults.mode = SLUG_MODE;

slug.defaults.modes[SLUG_MODE] = {
  replacement: '-',      // replace spaces with replacement 
  symbols: true,         // replace unicode symbols or not 
  remove: null,          // (optional) regex to remove characters 
  lower: true,           // result in lower case 
  charmap: slug.charmap, // replace special characters 
  multicharmap: slug.multicharmap // replace multi-characters 
}

export default name => slug(name);
