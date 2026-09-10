/* Navigation, accessibilité et vidéo. Fonctionne aussi par ouverture du fichier HTML. */
(() => {
  const header = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const links = document.getElementById('links');
  const mobile = matchMedia('(max-width:1120px)');
  const drop = links.querySelector('.nav-drop');
  const trigger = drop.querySelector('.nav-drop-trigger');
  const submenu = drop.querySelector('.nav-drop-menu');

  function setDrop(open) {
    drop.classList.toggle('open', open);
    trigger.setAttribute('aria-expanded', String(open));
    submenu.inert = !open;
  }
  function setMenu(open) {
    links.classList.toggle('open', open);
    links.inert = mobile.matches && !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    if (!open) setDrop(false);
  }
  burger.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  trigger.addEventListener('click', () => setDrop(!drop.classList.contains('open')));
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', e => { if (!header.contains(e.target)) setMenu(false); });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (drop.classList.contains('open')) { setDrop(false); trigger.focus(); }
    else if (links.classList.contains('open')) { setMenu(false); burger.focus(); }
  });
  header.addEventListener('focusout', () => {
    setTimeout(() => { if (!header.contains(document.activeElement)) setMenu(false); }, 0);
  });
  mobile.addEventListener('change', () => setMenu(false));
  setMenu(false);
  const measureHeader = () => document.documentElement.style.setProperty('--header-height', header.offsetHeight + 'px');
  new ResizeObserver(measureHeader).observe(header);
  measureHeader();

  document.querySelectorAll('.faq-q').forEach((button, i) => {
    const item = button.parentElement;
    const answer = item.querySelector('.faq-a');
    if (!answer) return;
    button.type = 'button';
    button.id ||= 'faq-question-' + (i + 1);
    answer.id ||= 'faq-reponse-' + (i + 1);
    button.setAttribute('aria-controls', answer.id);
    answer.setAttribute('role', 'region');
    answer.setAttribute('aria-labelledby', button.id);
    const setOpen = open => {
      item.classList.toggle('open', open);
      button.setAttribute('aria-expanded', String(open));
      answer.setAttribute('aria-hidden', String(!open));
      answer.inert = !open;
      answer.style.maxHeight = open ? answer.scrollHeight + 'px' : '0px';
    };
    setOpen(item.classList.contains('open'));
    button.addEventListener('click', () => setOpen(!item.classList.contains('open')));
    const inner = answer.querySelector('.faq-a-inner');
    if (inner) new ResizeObserver(() => {
      if (item.classList.contains('open')) answer.style.maxHeight = answer.scrollHeight + 'px';
    }).observe(inner);
  });

  const video = document.querySelector('.hero-video');
  const videoButton = document.getElementById('videoToggle');
  if (video && videoButton) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = false;
  let userStarted = false;
  let videoFailed = false;
  let home = false;
  const updateVideoButton = () => {
    videoButton.querySelector('span').textContent = video.paused ? 'Lire la vidéo' : 'Mettre en pause';
    videoButton.setAttribute('aria-label', video.paused ? 'Lire la vidéo de fond' : 'Mettre la vidéo de fond en pause');
  };
  function playVideo() {
    const source = video.querySelector('source');
    if (!source.hasAttribute('src')) { source.src = source.dataset.src; video.load(); }
    video.play().catch(updateVideoButton);
  }
  function syncVideo() {
    const saveData = navigator.connection?.saveData;
    const allowed = userStarted || (!reducedMotion.matches && !saveData);
    if (home && !document.hidden && allowed && !userPaused && !videoFailed) playVideo();
    else video.pause();
    updateVideoButton();
  }
  videoButton.hidden = false;
  videoButton.addEventListener('click', () => {
    if (video.paused) { userPaused = false; userStarted = true; syncVideo(); }
    else { userPaused = true; video.pause(); }
  });
  video.addEventListener('play', updateVideoButton);
  video.addEventListener('pause', updateVideoButton);
  video.querySelector('source').addEventListener('error', () => {
    videoFailed = true; videoButton.hidden = true; video.hidden = true;
  });
  reducedMotion.addEventListener('change', () => { userStarted = false; syncVideo(); });
  document.addEventListener('visibilitychange', syncVideo);
  document.addEventListener('viewchange', e => { home = e.detail === 'accueil'; syncVideo(); });

  }

  const loadMap = document.getElementById('loadMap');
  loadMap?.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.title = "Plan d'accès — 5 rue Paul Bert, Roanne";
    frame.src = 'https://www.google.com/maps?q=5%20rue%20Paul%20Bert%2042300%20Roanne&output=embed';
    frame.referrerPolicy = 'no-referrer';
    const container = loadMap.closest('.map');
    container.replaceChildren(frame);
    frame.focus();
  });
})();

  /* --- Navigation par onglets : chaque lien du menu affiche sa seule rubrique --- */
  (function(){

    // Les pages métier sont de vrais documents HTML, compatibles avec les anciens liens.
    var domainPages=['immobilier','successions','famille','entreprises'];
    var staticPage=document.body.dataset.page;
    if(location.protocol==='file:'){
      document.querySelectorAll('a[href]').forEach(function(a){
        var href=a.getAttribute('href');
        if(domainPages.some(function(domain){return href===domain+'/'||href==='../'+domain+'/';}))a.setAttribute('href',href+'index.html');
        else if(href.startsWith('../#'))a.setAttribute('href','../index.html'+href.slice(3));
      });
    }
    if(staticPage){
      document.dispatchEvent(new CustomEvent('viewchange',{detail:staticPage}));
      return;
    }
    function redirectDomain(view){
      if(!domainPages.includes(view))return false;
      var target=new URL(view+'/',location.href);
      if(location.protocol==='file:')target.pathname+='index.html';
      location.replace(target.href);
      return true;
    }
    var originalTitle=document.title;
    var views={
      'accueil':['accueil','aide'],
      'etude':['etude'],
      'histoire':['histoire'],
      'immobilier':['immobilier'],
      'successions':['successions'],
      'famille':['famille'],
      'entreprises':['entreprises'],
      'actualites':['actualites'],
      'outils':['outils'],
      'contact':['contact'],
      'rdv':['rdv','visio'],
      'faq':['faq'],
      'mentions':['mentions']
    };
    /* Titre affiché en tête de chaque onglet (rien pour l'accueil : la vidéo suffit) */
    var titles={
      'faq':{title:"Questions fréquentes",sub:"Quelques repères avant notre premier échange"},
      'etude':{eyebrow:"L'Étude",title:"Qui sommes-nous",sub:""},
      'histoire':{eyebrow:"L'Étude",title:"Histoire de l'étude",sub:"Plus de quatre siècles de mémoire"},
      'immobilier':{eyebrow:"Nos domaines",title:"Immobilier",sub:"Achat, vente, promotion, opérations de crédit, immobilier des professionnels, immobilier d'entreprise et des sociétés…",extra:'<div class="promo-pills" style="margin-top:1.6rem"><span class="promo-pill">Résidence principale</span><span class="promo-pill">Résidence secondaire</span><span class="promo-pill">Local professionnel</span><span class="promo-pill">Local commercial</span><span class="promo-pill">Investissement locatif</span><span class="promo-pill">Baux d\'habitation</span><span class="promo-pill">Défiscalisation</span><span class="promo-pill">Licitation</span><span class="promo-pill">Promotion immobilière</span></div>'},
      'successions':{eyebrow:"Nos domaines",title:"Successions",sub:"Vous avez perdu un parent, un proche&nbsp;?<br>Qui hérite, dans quelle proportion, à quel coût&nbsp;? L'Étude vous épaule à chaque étape du règlement de la succession.",extra:'<div class="promo-pills" style="margin-top:1.6rem"><span class="promo-pill">Règlement de succession</span><span class="promo-pill">Acte de notoriété</span><span class="promo-pill">Déclaration de succession</span><span class="promo-pill">Partage</span><span class="promo-pill">Liquidation</span><span class="promo-pill">Transmission du patrimoine</span><span class="promo-pill">Succession internationale</span></div>'},
      'famille':{eyebrow:"Nos domaines",title:"Famille",sub:"Protéger vos proches, préparer votre succession, transmettre votre patrimoine personnel et professionnel",extra:'<div class="promo-pills" style="margin-top:1.6rem"><span class="promo-pill">Contrat de mariage</span><span class="promo-pill">PACS</span><span class="promo-pill">Changement de régime matrimonial</span><span class="promo-pill">Régimes matrimoniaux internationaux</span><span class="promo-pill">Donation et donation-partage</span><span class="promo-pill">Donation entre époux</span><span class="promo-pill">Testament</span><span class="promo-pill">SCI familiale</span><span class="promo-pill">Divorce &amp; séparation</span><span class="promo-pill">Convention d\'indivision</span><span class="promo-pill">Gestion de patrimoine</span></div>'},
      'entreprises':{eyebrow:"Nos domaines",title:"Entreprises",sub:"De la création à la transmission",extra:'<div class="promo-pills" style="margin-top:1.6rem"><span class="promo-pill">Création de société</span><span class="promo-pill">SARL / SAS</span><span class="promo-pill">SCI</span><span class="promo-pill">Société d\'exercice libéral</span><span class="promo-pill">Protection de l\'entrepreneur</span><span class="promo-pill">Fonds de commerce</span><span class="promo-pill">Cession de titres sociaux</span><span class="promo-pill">Bail commercial</span><span class="promo-pill">Bail professionnel</span><span class="promo-pill">Location-gérance</span><span class="promo-pill">Transmission d\'entreprise</span><span class="promo-pill">Pacte Dutreil</span><span class="promo-pill">Opérations sur le capital</span><span class="promo-pill">Fusion &amp; dissolution</span></div>'},
      'actualites':{eyebrow:"L'Étude",title:"Actualités",sub:"Informations & vie de l'Étude"},
      'outils':{eyebrow:"Pratique",title:"Outils en ligne",sub:"Vos ressources, à portée de clic"},
      'rdv':{title:"Demander un rendez-vous",sub:"Au bureau, par téléphone ou en visioconférence"},
      'contact':{eyebrow:"Nous rencontrer",title:"Venir à l’Étude",sub:"Adresse, horaires et itinéraire"},
      'mentions':{eyebrow:"Informations",title:"Mentions légales",sub:"Informations légales et protection de vos données personnelles"}
    };
    var all=['accueil','aide','etude','histoire','immobilier','successions','famille','entreprises','actualites','faq','outils','rdv','visio','contact','mentions'];
    /* Couleur du bas de page (bandeau CTA + pied) accordée à chaque onglet */
    var themes={
      'accueil':{cta:'linear-gradient(180deg,#223A66 0%,#152848 45%,#0B1C3F 100%)',foot:'#0B1C3F'},
      'etude':{cta:'linear-gradient(180deg,#7C5E34 0%,#4A3820 45%,#241A0F 100%)',foot:'#241A0F'},
      'histoire':{cta:'linear-gradient(180deg,#223A66 0%,#152848 45%,#0B1C3F 100%)',foot:'#0B1C3F'},
      'immobilier':{cta:'linear-gradient(180deg,#1C42A0 0%,#143070 45%,#0B1C3F 100%)',foot:'#0B1C3F'},
      'successions':{cta:'linear-gradient(180deg,#2A5A4C 0%,#193F36 45%,#0C201C 100%)',foot:'#0C201C'},
      'famille':{cta:'linear-gradient(180deg,#B85567 0%,#7A3040 45%,#3A1A22 100%)',foot:'#3A1A22'},
      'entreprises':{cta:'linear-gradient(180deg,#3A566C 0%,#233848 45%,#131F29 100%)',foot:'#131F29'},
      'actualites':{cta:'linear-gradient(180deg,#3C4B82 0%,#232E56 45%,#12172E 100%)',foot:'#12172E'},
      'outils':{cta:'linear-gradient(180deg,#2A6270 0%,#164048 45%,#0C2027 100%)',foot:'#0C2027'},
      'contact':{cta:'linear-gradient(180deg,#7C5E34 0%,#4A3820 45%,#241A0F 100%)',foot:'#241A0F'},
      'mentions':{cta:'linear-gradient(180deg,#223A66 0%,#152848 45%,#0B1C3F 100%)',foot:'#0B1C3F'}
    };
    var ctaBand=document.getElementById('ctaBand');
    var footerEl=document.querySelector('footer');
    var header=document.getElementById('nav');
    /* Crée le bandeau-titre, inséré juste après l'en-tête fixe */
    var band=document.createElement('div');
    band.className='page-band';
    band.id='pageBand';
    document.getElementById('contenu').prepend(band);
    function current(){
      /* l'ancre mise de côté par le petit script du haut de page sert de secours */
      var h=(location.hash||'').replace('#','')||window.vueDemandee||'accueil';
      return views[h]?h:'accueil';
    }
    function paint(view){
      var t=titles[view];
      if(!t){band.style.display='none';return;}
      band.style.display='block';
      band.innerHTML='<div class="pb-inner">'
        +'<h1 tabindex="-1">'+t.title+'</h1>'
        +'<div class="pb-rule">❦</div>'
        +(t.sub?'<div class="pb-sub">'+t.sub+'</div>':'')
        +(t.extra||'')
        +'</div>';
      /* un ton de couleur par onglet */
      band.className='page-band pb-'+view;
      /* La hauteur de l'en-tête est mesurée automatiquement, y compris au zoom. */
      band.style.paddingTop='calc(var(--header-height) + 44px)';
    }
    function show(view, moveFocus){
      if(redirectDomain(view))return;
      var canonicalView=view;
      document.body.dataset.view=view;
      document.title=titles[canonicalView]?titles[canonicalView].title+' — Me Charlotte Diaz, notaire à Roanne':originalTitle;
      var ids=views[view]||views['accueil'];
      all.forEach(function(id){
        var el=document.getElementById(id);
        if(!el)return;
        if(ids.indexOf(id)>-1){el.classList.remove('view-hidden');}
        else{el.classList.add('view-hidden');}
      });
      /* accorde le bas de page au ton de l'onglet */
      var th=themes[canonicalView==='rdv'?'contact':canonicalView]||themes['accueil'];
      if(ctaBand){ctaBand.style.background=th.cta;}
      if(footerEl){footerEl.style.background=th.foot;}
      paint(canonicalView);
      document.querySelectorAll('#links a:not(.btn)').forEach(function(a){
        var active=a.getAttribute('href')==='#'+canonicalView;
        a.classList.toggle('active',active);
        if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
      });
      document.querySelector('.nav-drop-trigger').classList.toggle('active',['etude','histoire'].includes(canonicalView));
      document.dispatchEvent(new CustomEvent('viewchange',{detail:canonicalView}));
      if(moveFocus){
        var heading=canonicalView==='accueil'?document.querySelector('#accueil h1'):band.querySelector('h1');
        if(heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});}
      }
      /* Remonter en haut de page — deux fois : tout de suite, puis juste après,
         car sur téléphone le navigateur saute de lui-même vers la section (ancre)
         APRÈS ce premier scroll, ce qui cachait le bandeau-titre. */
      window.scrollTo({top:0,left:0,behavior:'instant'});
      setTimeout(function(){window.scrollTo({top:0,left:0,behavior:'instant'});},60);
      /* rendre visibles les éléments animés de la rubrique affichée */
      setTimeout(function(){
        document.querySelectorAll('.reveal').forEach(function(r){
          if(!r.closest('.view-hidden')){r.classList.add('in');}
        });
      },60);
    }
    /* ARME DÉFINITIVE contre le saut d'ancre (iPhone surtout) : on intercepte chaque
       clic sur un lien interne (#immobilier, #histoire...) AVANT le navigateur.
       pushState change l'adresse SANS déclencher le saut natif — puis on affiche
       l'onglet nous-mêmes, proprement, en haut de page. */
    document.addEventListener('click',function(e){
      var a=e.target.closest?e.target.closest('a[href^="#"]'):null;
      if(!a||e.defaultPrevented||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button>0)return;
      var id=(a.getAttribute('href')||'').slice(1);
      if(!views[id])return;
      e.preventDefault();
      if(location.hash!=='#'+id)history.pushState(null,'','#'+id);
      show(id,true);
    });
    window.addEventListener('hashchange',function(){show(current(),true)});
    window.addEventListener('popstate',function(){show(current(),true)});
    /* Le navigateur ne doit ni restaurer un ancien défilement, ni sauter vers l'ancre
       au chargement : on reprend la main pour que le bandeau-titre reste visible. */
    if('scrollRestoration' in history){history.scrollRestoration='manual';}
    window.addEventListener('load',function(){setTimeout(function(){window.scrollTo({top:0,left:0,behavior:'instant'});},80);});
    if(window.vueDemandee&&views[window.vueDemandee])history.replaceState(null,'','#'+window.vueDemandee);
    window.vueDemandee=null;
    show(current());
  })();
