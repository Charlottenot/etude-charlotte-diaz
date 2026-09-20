/* ══════════════════════════════════════════════════════════════════════
   BEAUTÉ DU SITE — les deux animations, 09/09/2026
   ──────────────────────────────────────────────────────────────────────
   Ce fichier ne fait QUE deux choses, et rien d'autre :
     1. la frise des notaires qui se déroule quand on descend dessus ;
     2. les trois chiffres qui défilent en arrivant à l'écran.
   Il ne touche à aucun autre comportement du site.

   POUR TOUT ANNULER : supprimer dans index.html la ligne
   <script src="assets/beaute.js" defer></script>
   ══════════════════════════════════════════════════════════════════════ */

(function(){
  'use strict';

  /* Si le navigateur est trop ancien pour "observer" le défilement,
     on affiche tout normalement et on s'arrête là. Aucun risque. */
  if(!('IntersectionObserver' in window)){
    document.documentElement.classList.add('sans-animation');
    return;
  }

  /* Réglage « je ne veux pas d'animation » de l'ordinateur ou du téléphone :
     on le respecte, on affiche tout d'un coup. */
  var sansMouvement = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function demarre(){

    /* ─── 1. LA FRISE DU TEMPS ───────────────────────────────────────
       Chaque ligne de la frise reçoit la classe "frise-in" quand elle
       entre à l'écran. C'est la feuille de style qui fait le reste. */

    var lignes = document.querySelectorAll('.her-item');
    var frises = document.querySelectorAll('.heritage');

    if(sansMouvement){
      lignes.forEach(function(l){ l.classList.add('frise-in'); });
      frises.forEach(function(f){ f.classList.add('frise-ligne'); });
    } else {
      var vigie = new IntersectionObserver(function(entrees){
        entrees.forEach(function(e){
          if(!e.isIntersecting) return;
          var el = e.target;
          /* petit décalage en cascade : chaque ligne arrive juste après
             la précédente, ce qui donne l'effet « qui se déroule ». */
          var rang = Number(el.dataset.rang || 0);
          setTimeout(function(){ el.classList.add('frise-in'); }, rang * 90);
          vigie.unobserve(el);
        });
      }, { threshold:0.15, rootMargin:'0px 0px -8% 0px' });

      frises.forEach(function(frise){
        frise.querySelectorAll('.her-item').forEach(function(l,i){
          l.dataset.rang = Math.min(i,8);   /* on plafonne : jamais plus de 0,7 s d'attente */
          vigie.observe(l);
        });
      });

      var vigieLigne = new IntersectionObserver(function(entrees){
        entrees.forEach(function(e){
          if(!e.isIntersecting) return;
          e.target.classList.add('frise-ligne');
          vigieLigne.unobserve(e.target);
        });
      }, { threshold:0.05 });
      frises.forEach(function(f){ vigieLigne.observe(f); });
    }

    /* Filet de sécurité : le site affiche ses rubriques par onglets.
       Si on ouvre l'onglet Histoire directement, certaines lignes ont pu
       être « observées » alors qu'elles étaient cachées. Au changement
       d'onglet, on remet la vigie à zéro sur ce qui est encore invisible. */
    document.addEventListener('viewchange', function(){
      setTimeout(function(){
        document.querySelectorAll('.her-item:not(.frise-in)').forEach(function(l){
          var r = l.getBoundingClientRect();
          if(r.top < window.innerHeight && r.bottom > 0){ l.classList.add('frise-in'); }
        });
      }, 400);
    });


    /* ─── 2. LES CHIFFRES QUI DÉFILENT ───────────────────────────────
       Chaque chiffre part de zéro et monte jusqu'à sa vraie valeur,
       en une seconde et demie. */

    function faisDefiler(el){
      var cible = Number(el.dataset.valeur);
      if(!cible || sansMouvement){ el.textContent = el.dataset.valeur; return; }
      var duree = 1500, depart = null;

      function pas(horodatage){
        if(depart === null) depart = horodatage;
        var avancement = Math.min((horodatage - depart) / duree, 1);
        /* la courbe ralentit à la fin : c'est plus élégant qu'un défilement plat */
        var douceur = 1 - Math.pow(1 - avancement, 3);
        el.textContent = Math.round(cible * douceur);
        if(avancement < 1){ requestAnimationFrame(pas); }
        else { el.textContent = el.dataset.valeur; }
      }
      requestAnimationFrame(pas);
    }

    var vigieChiffres = new IntersectionObserver(function(entrees){
      entrees.forEach(function(e){
        if(!e.isIntersecting) return;
        faisDefiler(e.target);
        vigieChiffres.unobserve(e.target);
      });
    }, { threshold:0.4 });

    document.querySelectorAll('.chiffre-nb[data-valeur]').forEach(function(c){
      c.textContent = '0';
      vigieChiffres.observe(c);
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', demarre);
  } else {
    demarre();
  }
})();
