
/**
 * gallery/detail.js
 *
 * @description :: Server-side controller action for handling incoming requests.
 * @help        :: See https://sailsjs.com/documentation/concepts/controllers
 */
module.exports = {
    inputs: {},
    exits: {
      success: {
        viewTemplatePath: 'frontend/pages/gallery/detail',
      },
      redirect: {
        responseType: 'redirect'
      }
    },
  
    fn: async function (inputs, exits) {
      sails.log.info("================================ controllers/frontend/gallery/detail ================================");
      
      let _default = await sails.helpers.getFeDefaultData(this.req)
        .tolerate('noSchoolFound', () => {
          throw { redirect: '/login' };
        });
      
      let albumID = _default.params.id ? _default.params.id : null;
      
      let albumObj = await AlbumService.get({ id: albumID })
      if (albumObj.photos.length > 0) {
          let arrayPhotos = [];
          for (let photo of albumObj.photos){
              let photoObj = await MediaService.get({ id: photo });
              if (photoObj) {
                  arrayPhotos.push(photoObj)
              }
          }
          albumObj.photos = arrayPhotos;
      }    
      sails.log(albumObj.photos);
      _default.albumObj = albumObj;
      return exits.success(_default);
    }
  };