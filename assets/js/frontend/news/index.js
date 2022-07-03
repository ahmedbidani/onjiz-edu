class IndexNewsFrontendEKP extends BaseBackendEKP {
    constructor() {
      super();
      this.initialize();
    }
  
    initialize() {
      //DO NOT LOAD UNNESSESARY CLASS
      //Init form + list if page have BOTH  
      this.form = new NewsFrontendEKP(this);
    }
  }
  
  class NewsFrontendEKP {
    constructor(opts) {
        _.extend(this, opts);
        
      this.initialize();
      this.checkLength();
      // this.handleClickCate();
      // this.handleClickPage()
    }
   
    initialize() {
      let _this = this;
    } 
    // handleClickCate() {
    //   $(document).ready(function() {
    //     $(".taxonomy a").click(function () {
    //       let searchParams = new URLSearchParams(window.location.search);
    //       let value = $(this).attr('at')
    //       let paging = searchParams.get('page') || 1;
    //       $.ajax({
    //         url: "http://localhost:1337/news?category=" + value +"&page=" + paging
    //         , success: function (result) {
            
    //       }});
    //     });
    // });
    // }
    // handleClickPage() {
    //   $(document).ready(function() {
    //     $(".page-item a").click(function () {
    //       let searchParams = new URLSearchParams(window.location.search);
    //       let paging = $(this).attr('at')
    //       let cate = searchParams.get('category') || 1;
    //       $.ajax({
    //         url: "http://localhost:1337/news?category=" + cate +"&page=" + paging
    //         , success: function (result) {
            
    //       }});
    //     });
    // });
    // }
    checkLength (){
      $(".motto-length").each(function(i){
       let len=$(this).text().length;
        if(len>60)
        {
          $(this).text($(this).text().substr(0,60)+'...');
        }
      });
    };
}
  
  