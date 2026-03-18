declare module "@mapbox/mapbox-gl-draw" {
  interface DrawOptions {
    displayControlsDefault?: boolean;
    controls?: Record<string, boolean>;
    defaultMode?: string;
    styles?: Array<Record<string, unknown>>;
  }

  class MapboxDraw {
    constructor(options?: DrawOptions);
    getAll(): GeoJSON.FeatureCollection;
    changeMode(mode: string): void;
    delete(id: string): MapboxDraw;
    deleteAll(): MapboxDraw;
    add(geojson: GeoJSON.Feature | GeoJSON.FeatureCollection): string[];
    set(featureCollection: GeoJSON.FeatureCollection): string[];
    get(id: string): GeoJSON.Feature | undefined;
    getSelected(): GeoJSON.FeatureCollection;
    getSelectedIds(): string[];
    setFeatureProperty(featureId: string, property: string, value: unknown): MapboxDraw;
    trash(): MapboxDraw;
    combineFeatures(): MapboxDraw;
    uncombineFeatures(): MapboxDraw;
  }

  export default MapboxDraw;
}

declare module "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css" {
  const content: string;
  export default content;
}
