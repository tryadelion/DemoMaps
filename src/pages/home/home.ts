import { Component, NgZone } from '@angular/core';
import { Platform, NavController } from 'ionic-angular';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  MarkerIcon,
  Marker,
  MarkerCluster,
  GoogleMapsAnimation,
  HtmlInfoWindow
} from '@ionic-native/google-maps';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  map: GoogleMap;
  MarkerCluster: MarkerCluster;
  htmInfoWindow: HtmlInfoWindow;
  lastMarker: Marker;
  constructor(public navCtrl: NavController, public platform: Platform, private _ngZone: NgZone, private googleMaps: GoogleMaps) {

  }


  ionViewDidLoad() {
    this.platform.ready().then(() => {
      this.loadMap();
    });
  }

  onMarkerClick(params: any[]) {
    this.clearLast();
    let marker:Marker = <Marker> params.pop();
    console.log(marker);
    var image = {
      url: "assets/img/farmselect.png",
      size: {
        width: 22,
        height: 32
      }
    }
    marker.setIcon(image)
    let html: string =
      '<div onClick="javascript:alert(\'hi\')" class="infowindowContent">' +
      '<h3>Farmacia ' + marker.get("farmaId") + '</h3>' +
      '<br />' +
      '<p>Lorem ipsum<br />667733<br /> De dilluns a divendres</p>' +
      '<img class="colImg" src="assets/img/clusterer.png"/>' +
      '</div>';
    this.htmInfoWindow.setContent(html);
    this.htmInfoWindow.open(marker);
    this.lastMarker = marker;
  }

  clearLast() {
    if (this.lastMarker != undefined) {
      var image = {
        url: "assets/img/farmacia.png",
        size: {
          width: 22,
          height: 32
        }
      }
      this.lastMarker.setIcon(image);
    } else {
      console.log("marker is undefined");
    }
  }


  loadMap() {
    let mapOptions: GoogleMapOptions = {
      controls: {
        myLocationButton: false,
        mapToolbar: false
      },
      camera: {
        target: {
          lat: 41.6166565,
          lng: 0.6290362
        },
        zoom: 9
      }
    };
    
    this.map = GoogleMaps.create('map_canvas', mapOptions);
    this.map.one(GoogleMapsEvent.MAP_READY)
      .then(() => {
        this.htmInfoWindow =  new HtmlInfoWindow();
        console.log('Map is ready!');
        this.loadItems();
        this.map.on(GoogleMapsEvent.MAP_CLICK).subscribe((res) => {
          console.log("Map Clicked");
          console.log(this.lastMarker);
          this.clearLast();
        });
      });
  }


  loadItems() {
    this.map.addMarkerCluster({
      maxZoomLevel: 14,
      boundsDraw: false,
      markers: [],
      icons: [
        {
          min: 5, url: "assets/img/clusterer.png",
          anchor: { x: 21, y: 21 },
          label: {
            color: "white",
            bold: true,
            italic: false,
            fontSize: 14
          },
          size: {
            width: 42,
            height: 42
          }
        }
      ]
    }).then(cluster => {
      this.MarkerCluster = cluster;
      this.MarkerCluster.on(GoogleMapsEvent.MARKER_CLICK).subscribe((params)=> {
        this.onMarkerClick(params);
      });
      this.MarkerCluster.on(GoogleMapsEvent.CLUSTER_CLICK).subscribe((params) => {
        this.clearLast();
      });
      var one = {Nom : "ONE","Adreca": "ONE AD",pos_y: 41.624615, pos_x : 0.6258626};
      var two = {Nom : "TWO","Adreca": "TWO AD",pos_y: 41.624615, pos_x : 0.6238626};
      var three = {Nom : "THREE","Adreca": "THREE AD",pos_y: 41.624615, pos_x : 0.6248626};
      this.createMarker(one, this.map);
      this.createMarker(two, this.map);
      this.createMarker(three, this.map);
      this.map.setCameraZoom(10);
    });
  }


  createMarker(next, map: GoogleMap) {
    var image = {
      url: "assets/img/farmacia.png",
      size: {
        width: 22,
        height: 32
      }
    }
    console.log(next);
    const markerOption = {
      title: null,
      snippet: null,
      icon: image,
      position: {
        lat: Number(next.pos_y),
        lng: Number(next.pos_x)
      },
      "styles": {
        "maxWidth": "80%"
      },
      content: JSON.stringify(next)
    }
    this.MarkerCluster.addMarker(markerOption);
  }
}
