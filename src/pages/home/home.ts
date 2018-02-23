import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Loading, Platform, LoadingController, ModalController, Events, ToastCmp, ToastController, AlertController, MenuController, Content } from 'ionic-angular';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  Marker,
  GoogleMapsAnimation,
  MyLocation,
  GoogleMapOptions,
  MarkerCluster
} from '@ionic-native/google-maps';
import { Http } from '@angular/http';
/**
 * Generated class for the DebugHomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
declare var window;
declare var cordova;
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {
  @ViewChild(Content) content : Content;
  total_markers: any[] = [];
  userLat = 0.0;
  userLng = 0.0;
  nearLat = 0.0;
  nearLng = 0.0;
  userMarker: any = null;
  public loading: Loading;
  iphoneX = false;
  map: GoogleMap;
  selected: any = null;
  cluster: MarkerCluster;
  constructor(public navCtrl: NavController,
    private platform: Platform,
    private googleMaps: GoogleMaps,
    private alertCtrl : AlertController,
    private events: Events,
    private http : Http,
    private loadingCtrl: LoadingController,
    private toastCtrl : ToastController,
    private _ngZone: NgZone,
    private menuCtrl : MenuController,
    private modalCtrl: ModalController,
    public navParams: NavParams) {
      var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      var ratio = window.devicePixelRatio || 1;
      var screen = {
        width : window.screen.width * ratio,
        height : window.screen.height * ratio
      };

// iPhone X Detection
  if (iOS && screen.width == 1125 && screen.height === 2436) {
	  // Set a global variable now we've determined the iPhoneX is true
    this.iphoneX = true;
    //alert("IPHONE X!");
	  // Adds a listener for ios devices that checks for orientation changes.
    }
  }

  ionViewDidLoad() {
    this.menuCtrl.swipeEnable(true, "left");
    this.menuCtrl.swipeEnable(false, "right");
    this.events.publish("ReloadCount");
    this.events.publish("updateToken");
    this.platform.ready().then(() => {
      this.loadMap();
    });
  }

  ionViewWillLeave() {
   
  }

  ionViewWillEnter() {
    
  }

  fixToUser() {

  }

  showInfoTutorial() {
    //HomeTutorialComponent
   
  }

  closeDetail() {
    this.selected = null;
  }
  loadMap() {
    this.loading = this.loadingCtrl.create();
    this.loading.present();
    let mapOptions  = {
      controls: {
        myLocation: true,
        myLocationButton: false,
        zoom: false,
        mapToolbar: false
      },
      camera: {
        target: {
          lat: 41.5998736,
          lng: 0.5808569
        },
        zoom: 13
      }
    };
    if(this.map == null){
      this.map = GoogleMaps.create('map_canvas', mapOptions);
    }else{
      this.loading.dismiss();
    }
   
    // Wait the MAP_READY before using any methods.
    this.map.one(GoogleMapsEvent.MAP_READY)
      .then(() => {
        console.log('Map is ready!');

        this.map.on(GoogleMapsEvent.MAP_CLICK).subscribe((latLng) => {
          console.log("MAP CLICK");
          this._ngZone.run(() => {
            this.selected = null;
          });
        });
        this.map.addMarkerCluster({
          markers: [],
          maxZoomLevel: 11,
          boundsDraw: false,
          icons: [
            {
              min: 4,
              url: "assets/img/clusters/mglobal.png",
              anchor: {
                x: 32, y: 32
              },
              label: {
                color: "#FFFFFF"
              },
              size: {
                width: 44,
                height: 44
              },
              origin: {
                x: 0,
                y: 0
              }
            },
            {
              min: 10,
              url: "assets/img/clusters/mglobal.png",
              anchor: {
                x: 32, y: 32
              },
              label: {
                color: "#FFFFFF"
              },
              size: {
                width: 58,
                height: 58
              },
              origin: {
                x: 0,
                y: 0
              }
            },
            {
              min: 100,
              url: "assets/img/clusters/mglobal.png",
              anchor: {
                x: 32, y: 32
              },
              label: {
                color: "#FFFFFF"
              },
              size: {
                width: 64,
                height: 64
              },
              origin: {
                x: 0,
                y: 0
              }
            }
          ]
        }).then((cluster) => {
          this.cluster = cluster;
          this.cluster.on(GoogleMapsEvent.MARKER_CLICK)
            .subscribe((markerClickEvent) => {
              console.log("MARKER_CLICK");
              this._ngZone.run(() => {
                let marker: Marker = markerClickEvent.pop();
                this.onMarkerClick(marker);
              });
            });
          this.beginMarkerProcess();
        });
        this.map.on(GoogleMapsEvent.MAP_LONG_CLICK).subscribe((latLng) => {
          console.log("MAP LONG CLICK");
          this._ngZone.run(() => {
            this.selected = null;
          });

        });
      });

  }
  beginMarkerProcess() {
    this._ngZone.run(() => {
      this.userLat = 41.92828282;
      this.userLng = 0.200030303;
      this.http.get("assets/data.json").subscribe((res : any) => {
        console.log(res);
        var data = res.json();
        console.log(data);
        data.forEach(item => {
          this.createMarker(this.fromJson(item),true);
        });
        this.loading.dismiss();
        this.map.setCameraZoom(13);
      },(err) => {
        console.log(err);
        this.loading.dismiss();
      });
    });
  }
  
  onMarkerClick(marker: Marker) {
    var data = marker.get("meta");
    this.selected = data; 
    this.map.animateCamera({
      target: { lat: marker.getPosition().lat, lng: marker.getPosition().lng },
      duration: 300,
      padding: 0  // default = 20px
    });
  }

  loadMenu(m) {
    this.showError("button clicked");
  }

  nearestMarker() {
    this.showError("button clicked");
  }

  beginIncidence() {
    this.showError("button clicked");
  }



  createMarker(m: any, needToPush) {
    console.log(m);
    if (m.show_map == 0) {
      return;
    }
    var icon = {
      url: 'assets/img/clusters/mglobal.png',
      // This marker is 32 pixels wide by 32 pixels high.
      size: {
        width: 32,
        height: 32
      },
      // The origin for this image is (0, 0).
      origin: {
        x: 0,
        y: 0
      },
      // The anchor for this image is the base of the flagpole at (0, 32).
      anchor: {
        x: 16,
        y: 32
      }
    };
    var marker = {
      title: null,
      icon: icon,
      position: {
        lat: m.latitude,
        lng: m.longitude
      }
    }
    marker["meta"] = m;
    /*this.map.addMarker(marker).then((marker) => {
      marker.on(GoogleMapsEvent.MARKER_CLICK)
        .subscribe((markerClickEvent) => {
          console.log("MARKER_CLICK");
          this._ngZone.run(() => {
            let marker: Marker = markerClickEvent.pop();
            this.onMarkerClick(marker);
          });
        });
    });*/
    this.total_markers.push(marker);
    this.cluster.addMarker(marker);
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180)
  }

  fromJson(object) {
    var temp : any = {};
    temp.latitude = object.geometry.coordinates[1];
    temp.longitude = object.geometry.coordinates[0];
    temp.icon = object.properties.icon + ".png";
    temp.name = object.properties.thoroughfare;
    temp.realName = object.properties.name_line;
    temp.administrativeArea = object.properties.administrative_area;
    temp.country = object.properties.country;
    temp.id = Number(object.properties.id);
    temp.show_map = object.properties.show_map;
    temp.postalCode = object.properties.postal_code;
    temp.publicAccess = object.properties.public_access;
    temp.telecontrol = object.properties.telecontrol;
    temp.locality = object.properties.locality;
    temp.informationEnabled = true;
    return temp;
}

  getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = this.deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    let ret = Number(d.toFixed(2));
    if(ret == 0){
        ret = 0.001;
    }
    return ret;
  }

  showError(message) {
    let alert = this.alertCtrl.create({
      title: 'DemoProject',
      subTitle: message,
      buttons: ['ok']
    });
    alert.present();
  }
}
