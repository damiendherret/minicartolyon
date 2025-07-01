import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import {get as getProjection, fromLonLat} from 'ol/proj.js';
import {getTopLeft, getWidth} from 'ol/extent.js';
import WMTS from 'ol/source/WMTS.js';
import WMTSTileGrid from 'ol/tilegrid/WMTS.js';


const allLayers = [];

//init layers
const osmTl = new TileLayer({source: new OSM()})
osmTl.layerName='OSM';
osmTl.layerId='osm';
allLayers.push(osmTl);

const orthoLyonTl = new TileLayer({opacity: 0.95, source: prepareOrthoLyonLayer()});
orthoLyonTl.layerName='Photo Lyon';
orthoLyonTl.layerId='orthoLyon';
allLayers.push(orthoLyonTl); 


const cadastralParcelsTl = new TileLayer({opacity: 0.5, source: prepareCadastralParcelsLayer()});
cadastralParcelsTl.layerName='Parcelles Cadastrales';
cadastralParcelsTl.layerId='cadastralParcels';
allLayers.push(cadastralParcelsTl);

// Peupler le catalogue au chargement
populateCatalog(allLayers);

// Get references to the catalog and toggle button
const catalog = document.getElementById('catalogContainer');
const toggleButton = document.getElementById('toggleButton');

// Add click event listener to the toggle button
toggleButton.addEventListener('click', () => {
  // Toggle the 'open' class on the catalog
  catalog.classList.toggle('open');
  toggleButton.classList.toggle('open');

  // Change the arrow direction based on the catalog state
  if (catalog.classList.contains('open')) {
    toggleButton.textContent = '>' // '◀'; // Arrow pointing left
  } else {
    toggleButton.textContent = '<' //'➤'; // Arrow pointing right
  }
});

const map = new Map({
  target: 'map',
  layers: allLayers,
  view: new View({
    center: fromLonLat([4.8640, 45.8791]),
    zoom: 20
  })
});



function prepareOrthoLyonLayer (){
  
  //TMS
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

  //layer : 
  return new WMTS({
    attributions: '',
    url: 'https://data.grandlyon.com/geoserver/gwc/service/wmts',
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
    })
}


function prepareCadastralParcelsLayer (){
  //TMS
  const projection = getProjection('EPSG:3857');
  const projectionExtent = projection.getExtent();
  const size = getWidth(projectionExtent) / 256;
  const resolutions = new Array(20);
  const matrixIds = new Array(20);
  for (let z = 0; z < 20; ++z) {
    // generate resolutions and matrixIds arrays for this WMTS
    resolutions[z] = size / Math.pow(2, z);
    matrixIds[z] = z;
  }

    //layer : 
    return new WMTS({
      attributions: '',
      url: 'https://data.geopf.fr/wmts',
      layer:'CADASTRALPARCELS.PARCELLAIRE_EXPRESS',
      matrixSet: 'PM_0_19',
      format: 'image/png',
      projection: projection,
      style: 'normal',  
      tileGrid: new WMTSTileGrid({
        origin: getTopLeft(projectionExtent),
        resolutions: resolutions,
        matrixIds: matrixIds,
        }),
      })

}



// Fonction pour peupler le catalogue
function populateCatalog(layers) {
  const container = document.getElementById('checkboxContainer');
  container.innerHTML = ''; // Nettoyer le contenu existant

  layers.forEach(layer => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = layer.layerId;
    checkbox.value = layer.layerId;
    checkbox.checked = true; 
    checkbox.addEventListener('change', event => handleLayerToggle(event, layer));

    const opacitySlider = document.createElement('input');
    opacitySlider.type = 'range';
    opacitySlider.min = 0;
    opacitySlider.max = 1;
    opacitySlider.step = 0.1;
    opacitySlider.value = layer.getOpacity();
    opacitySlider.addEventListener('input', event => handleOpacityChange(event, layer));

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(layer.layerName));
    label.appendChild(opacitySlider);
    container.appendChild(label);
  });
}


// Fonction pour gérer l'ajout/retrait des couches
function handleLayerToggle(event, layer) {
  if (event.target.checked) {
    map.addLayer(layer);
  } else {
    map.removeLayer(layer);
  }
}


// Fonction pour gérer le changement d'opacité
function handleOpacityChange(event, layer) {
  layer.setOpacity(parseFloat(event.target.value));
}







