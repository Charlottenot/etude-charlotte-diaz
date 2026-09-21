// Bandeau de cookies — ajouté le 21/09/2026, exigé par la Chambre.
// Le choix du visiteur reste sur son ordinateur (localStorage) : rien n'est
// envoyé à l'Étude, et le bandeau ne réapparaît pas une fois fermé.
(function(){
  var bar=document.getElementById('cookieBar');
  if(!bar) return;
  try{
    if(localStorage.getItem('cookiesOk')==='1') return;
  }catch(e){}
  bar.hidden=false;
  var btn=document.getElementById('cookieOk');
  btn.addEventListener('click', function(){
    bar.hidden=true;
    try{ localStorage.setItem('cookiesOk','1'); }catch(e){}
  });
})();
