// Allow importing `.js` modules referenced by Next's generated types (e.g. ../app/page.js)
declare module "*.js" {
  const value: any;
  export default value;
}

declare module "next/dist/compiled/@edge-runtime/primitives";
