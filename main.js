import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import {get as getProjection, fromLonLat} from 'ol/proj.js';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';

import WMTSCapabilities from 'ol/format/WMTSCapabilities.js';
import {getTopLeft, getWidth} from 'ol/extent.js';
import WMTS from 'ol/source/WMTS.js';
import WMTSTileGrid from 'ol/tilegrid/WMTS.js';


//proj4.defs('EPSG:2154', '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
//proj4.defs("EPSG:3946","+proj=lcc +lat_0=46 +lon_0=3 +lat_1=45.25 +lat_2=46.75 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs");
//register(proj4);

//const projection = getProjection('EPSG:6946');
//const projectionExtent = [0, 6000000, 1200000, 7200000];


const projection = getProjection('EPSG:900913');
const projectionExtent = projection.getExtent();
const size = getWidth(projectionExtent) / 256;
const resolutions = new Array(31);
const matrixIds = new Array(31);
for (let z = 0; z < 31; ++z) {
  // generate resolutions and matrixIds arrays for this WMTS
  resolutions[z] = size / Math.pow(2, z);
  matrixIds[z] = 'EPSG:900913:'+z;
}

//https://data.grandlyon.com/fr/geoserv/gwc/service/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&TILEMATRIX=EPSG:900913:0&TILEMATRIXSET=EPSG:900913&TILECOL=0&TILEROW=0&LAYER=metropole-de-lyon:ima_gestion_images.imaortho2023tif500m5cmcc46&FORMAT=image/png
//https://data.grandlyon.com/fr/geoserv/gwc/service/wmts?layer=metropole-de-lyon%3Aima_gestion_images.imaortho2023tif500m5cmcc46&style=default&tilematrixset=EPSG%3A900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng&TileMatrix=11&TileCol=1055&TileRow=730
//https://data.grandlyon.com/geoserver/gwc/service/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=grandlyon%3Aortho_2023&STYLE=raster&FORMAT=image%2Fpng&TILEMATRIXSET=EPSG%3A4326&TILEMATRIX=EPSG%3A4326%3A16&TILEROW=16065&TILECOL=67307

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    }),
    new TileLayer({
      opacity: 0.95,
      source: new WMTS({
        attributions: '',
        //url: 'https://data.grandlyon.com/fr/geoserv/gwc/service/wmts',
        url: 'https://data.grandlyon.com/geoserver/gwc/service/wmts',
        //layer: 'metropole-de-lyon:ima_gestion_images.imaortho2023tif500m5cmcc46',
        layer:'grandlyon:ortho_2023',
        matrixSet: 'EPSG:900913',
        format: 'image/png',
        projection: projection,
        style: 'raster',  
        tileGrid: new WMTSTileGrid({
          origin: getTopLeft(projectionExtent),
          resolutions: resolutions,
          matrixIds: matrixIds,
        }),
        wrapX: true,
      }),
    })
  ],
  view: new View({
    center: fromLonLat([4.8640, 45.8791]),
    zoom: 20
  })
});
