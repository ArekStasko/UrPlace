//this is styles from mapbox
import * as turf from '@turf/turf'
import { ModalUi } from './UI-modules';

export const mapLayer = (map, geolocate) => {

  const modalUi = new ModalUi()

  return map.on("load", () => {
    if (!navigator.geolocation) {
      modalUi.localizationFailed(
        'Your browser does not support localization', 
        'Location feature is not available in your browser - please use a more modern browser or manually enter an address.'
        )
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (res) => {
        const coords = {
          lat: res.coords.latitude,
          lng: res.coords.longitude,
        };
        const myLocation = document.getElementById("my-location");
        myLocation.textContent = `${coords.lat} ${coords.lng}`;
        map.jumpTo({
          center: [coords.lng, coords.lat],
        });
      },
      (error) => {
        modalUi.localizationFailed(
          'We can\'t locate you', 
          'Unfortunately, without agreeing to locate you, you cannot use the yourPlace application, please accept localization and refresh the page'
          )
      }
    );

    const layers = map.getStyle().layers;
    const labelLayerId = layers.find(
      (layer) => layer.type === "symbol" && layer.layout["text-field"]
    ).id;

    const routeSrc = turf.featureCollection([])

    map.addSource('route', {
      type: 'geojson',
      data: routeSrc,
    })

    map.addLayer(
      {
        id: "add-3d-buildings",
        source: "composite",
        "source-layer": "building",
        filter: ["==", "extrude", "true"],
        type: "fill-extrusion",
        minzoom: 24,
        paint: {
          "fill-extrusion-color": "#aaa",
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],
            5,
            0,
            15.05,
            ["get", "height"],
          ],
          "fill-extrusion-base": [
            "interpolate",
            ["linear"],
            ["zoom"],
            15,
            0,
            15.05,
            ["get", "min_height"],
          ],
          "fill-extrusion-opacity": 0.6,
        },
      },
      labelLayerId
    );

    map.addLayer(
      {
        id: 'routeline-active',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3887be',
          'line-width': ['interpolate', ['linear'], ['zoom'], 12, 3, 22, 12]
        }
      },
      'waterway-label'
    );
    //locate the user after load the styles
    geolocate.trigger();
  });
};
