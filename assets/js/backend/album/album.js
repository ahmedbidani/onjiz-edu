class IndexViewAlbumBackendEKP extends BaseBackendEKP {
	constructor() {
		super();
		this.initialize();
	}

	initialize() {
		//DO NOT LOAD UNNESSESARY CLASS
		//Init form + list if page have BOTH  
		this.view = new ViewIndexAlbumBackendEKP(this);
    }
    
}
class ViewIndexAlbumBackendEKP {
    constructor(opts) { 
        _.extend(this, opts);
        if ($("#lightgallery").length) {
            $("#lightgallery").lightGallery();
          }
        
          if ($("#lightgallery-without-thumb").length) {
            $("#lightgallery-without-thumb").lightGallery({
              thumbnail: true,
              animateThumb: false,
              showThumbByDefault: false
            });
          }
        
          if ($("#video-gallery").length) {
            $("#video-gallery").lightGallery();
          }
    }
}