
const API_URL = 'https://api.currentsapi.services/v1/';
const NEWS_URL = 'https://api.currentsapi.services/v1/latest-news';
const CATA_URL = 'https://api.currentsapi.services/v1/available/categories';
const LANG_URL = 'https://api.currentsapi.services/v1/available/languages';
const REGION_URL = 'https://api.currentsapi.services/v1/available/regions';
const API_KEY = '0rod4EeW-UzxgwLgQ5ec8TxSddXxA8r8iXIYrbxyw2ysQLm1';

const LANG = 'en';
let pageNumber = 1;
let isLastPage = false;



async function fetchNews(){
  
    try{
      
        const response = await fetch(buildSearchString());
        const data = await response.json();
        const newsArray = data.news;
        isLastPage = newsArray.length < 30
    
        if(isLastPage){
          removeNextButton();
        }
        else{
           addNextButton();
          }
        $('#news-container').empty()
  
        newsArray.forEach(newsItem=> {
      
          return $('#news-container').append(renderNewCard(newsItem)[0])  
        });
       
      }
  
       catch(error){
          console.error(error);
       }

}


fetchNews()

function removeNextButton(){
  $('#next').addClass('hide')
}

function addNextButton(){
  $('#next').removeClass('hide')
}




async function fetchCategories() {
    const url = `${CATA_URL}?language=${LANG}&apiKey=${API_KEY}`;
    console.log(url)
    
    if (localStorage.getItem('categories')){
        return JSON.parse(localStorage.getItem('categories'));
    }


    try {
        const response = await fetch(url)
        const data = await response.json();
        localStorage.setItem('categories', JSON.stringify(data));
        return data;
      
    }

    catch(error){
        console.error(error);
    }

}

async function fetchLanguages() {
    const url = `${LANG_URL}?language=${LANG}&apiKey=${API_KEY}`;

    if (localStorage.getItem('languages')){
        return JSON.parse(localStorage.getItem('languages'));
    }


    try {
        const response = await fetch(url)
        const data = await response.json();
        localStorage.setItem('languages', JSON.stringify(data));
        return data;
      
    }

    catch(error){
        console.error(error);
    }
}   


async function fetchRegions() {
    const url = `${REGION_URL}?language=${LANG}&apiKey=${API_KEY}`;

  
    if (localStorage.getItem('regions')){
        return JSON.parse(localStorage.getItem('regions'));
    }


    try {
        const response = await fetch(url)
        const data = await response.json();
        localStorage.setItem('regions', JSON.stringify(data));
        return data;
      
    }

    catch(error){
        console.error(error);
    }
}

async function prefetchLists() {

  try{
    const data = await Promise.all([
        fetchCategories(),
        fetchLanguages(),
        fetchRegions()
      ]);

      console.log(data);
      
    const [ categoryData, languageData, regionData ] = data;
      
    categoryData.categories.forEach(category => 
        
        $('#select-category').append($(`<option value="${ category  }">${ category }</option>`))
        
        );
    
    const languageObject = languageData.languages;

    Object.keys(languageObject).forEach(language => 

            $('#select-language').append($(`<option value="${ languageObject[language] }">${ language }</option>`))
        );

    const regionObj = regionData.regions
    
    Object.keys(regionObj).forEach(region =>

        $('#select-region').append($(`<option value="${ regionObj[region] }">${ region }</option>`))
        )
   
   }

  catch(error){
      console.error(error);
  }

}

prefetchLists();


function buildSearchString() {
    
    let SEARCH_URL = `https://api.currentsapi.services/v1/search?apiKey=${API_KEY}`;
    const CATEGORY = $('#select-category').val();
    const LANGUAGE = $('#select-language').val();
    const REGION = $('#select-region').val();
    const KEYWORDS = $('#keywords').val();
    
    if (!KEYWORDS && !CATEGORY && !LANGUAGE && !REGION){
     
      return `${NEWS_URL}?language=${LANG}&apiKey=${API_KEY}&page_number=${pageNumber}`;
         
    }

    if(LANGUAGE) { 
        SEARCH_URL += `&language=${ LANGUAGE }`;
     }
     else {
        SEARCH_URL += `&language=${ LANG }`;
     }

    if(CATEGORY) {
        SEARCH_URL += `&category=${CATEGORY}`;
    }

    if(REGION) {

        SEARCH_URL += `&country=${ REGION }`;
    }

    if(KEYWORDS) {

        SEARCH_URL += `&keywords=${ KEYWORDS }`
    } 
    
    if(pageNumber) {

       SEARCH_URL += `&page_number=${pageNumber}`
    }
    
    const encodeURL = encodeURI(SEARCH_URL)

    return encodeURL;

}


$('#search').on('submit', function (event) {

    pageNumber = 1;
    
    event.preventDefault();
    fetchNews();

    $('#page-number').text(pageNumber)
   
});


function renderNewCard(news) {
  
  const { image, url, title, description, author, category } = news;

  let categoryList = category.map( categoryItem  => {

    const CATEGORY_URL = `https://api.currentsapi.services/v1/search?apiKey=${API_KEY}&category=${ categoryItem }`

    return `<h5><a id="category" href="${ CATEGORY_URL }">${ categoryItem }</a></h5>`

  }
  ).join('');

 
  
  let newsElement = $(`
  <div>
    <article id="news-article" class="card">
     ${ image != 'None'  
     ? `<a href="${ image }" target="_blank"><img src="${ image }"/></a>`
     : ''
     }
     <h3>${ title }</h3>
     <p>${ description }</p>
      <footer>
      <h4><a href="${ url }" target="_blank">Read more...</a></h4>
        <h4>By ${ author }</h4>
     ${ categoryList }
      </footer>
    </article>
  </div>`)
  
  return newsElement;

}

$('#news-container').on('click', '#category', async function (event) {
    
    const href = $(this).attr('href');
  
    event.preventDefault();
  

    try {
      const response = await fetch(href);
      const data = await response.json();
      const newsArray = data.news;
      
      $('#news-container').empty()

      newsArray.forEach(newsItem=> {
    
        return $('#news-container').append(renderNewCard(newsItem)[0])  }

      )
 
    } 
    catch (error) {
      console.error(error);
    } 
   
  });



  $('#pagination').on('click', '#next', async function(event) {
    
  
    try{
  
      pageNumber += 1
      const response = await fetchNews();
      
    }

    catch(error){
      console.log(error);
    }

     $('#page-number').text(pageNumber)
     
     

  });


  $('#pagination').on('click', '#previous', async function(event) {
    
    if(pageNumber > 1) {

      try{
       
        pageNumber -= 1
        const response = await fetchNews();
        
      }
  
      catch(error){
        console.log(error);
      }

     $('#page-number').text(pageNumber)
    }
  });

