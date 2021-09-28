//env token
const token = process.env.MAPBOX_TOKEN;
mapboxgl.accessToken = token;

const mbxDirections = require("@mapbox/mapbox-sdk/services/directions");
import * as turf from '@turf/turf'
const directions = mbxDirections({ accessToken: token });
import { mapLayer } from "./utilities/map-styles";
import { Map } from "./utilities/map";

export class MapControl {
  constructor() {
    this.map = Map();
    this.markers;
    this.locateUser = this.locateUser;
    this.findPlace = this.findPlace;
  }

  copyLocation() {
    //http://www.google.com/maps/place/lat,lng
  }

  locateUser() {
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
      showAccuracyCircle: false,
    });
    //add special map design and geolocate to locate the user
    mapLayer(this.map, geolocate);
    this.map.addControl(geolocate);
  }

  findPlace(lat, lng) {
    // set user view to marker with find place
    this.map.flyTo({
      center: [lat, lng],
      essential: true,
    });

    // delete actual marker if there is
    if (this.markers !== undefined) this.markers.remove();

    this.markers = new mapboxgl.Marker({ color: "#cb8347", draggable: true })
      .setLngLat([lat, lng])
      .addTo(this.map);
  }

  showRoute() {
    console.log(this.markers._lngLat.lng, this.markers._lngLat.lat);

    directions
      .getDirections({
        profile: "driving-traffic",
        geometries: "geojson",
        waypoints: [
          {
            coordinates: [21.1943424, 49.659904],
          },
          {
            coordinates: [this.markers._lngLat.lng, this.markers._lngLat.lat],
          },
        ],
      })
      .send()
      .then(res => {
        const directionRoute = res.body;
        // I have to find wayo to generate correct GeoJSON object,
        // for now this line of code is not working and generate type of data error
       // this.map.getSource('route').setData(directionRoute)
       const routeGeoJSON = turf.featureCollection([
        turf.feature(directionRoute.routes[0].geometry) 
       ])
        console.log(routeGeoJSON);
        this.map.getSource('route').setData(routeGeoJSON)
      })
      .catch((e) => {
        console.log(e);
      });
  }
}
