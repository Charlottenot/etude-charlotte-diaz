/* Une seule coordonnée obligatoire selon le mode de réponse choisi. */
(() => {
  const form = document.getElementById('formContact');
  if (!form) return;
  const email = form.elements.email;
  const phone = form.elements.tel;
  const preference = form.elements.reponse;
  function updatePreference() {
    const byEmail = preference.value === 'email';
    email.required = byEmail;
    phone.required = !byEmail;
    form.querySelector('label[for="f-email"]').textContent = byEmail ? 'E-mail *' : 'E-mail (facultatif)';
    form.querySelector('label[for="f-tel"]').textContent = byEmail ? 'Téléphone (facultatif)' : 'Téléphone *';
  }
  preference.addEventListener('change', updatePreference);
  form.addEventListener('reset', () => setTimeout(updatePreference, 0));
  updatePreference();
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.checkValidity() || form.elements._honey.value || form.getAttribute('aria-busy') === 'true') return;
    const button = form.querySelector('button');
    const status = document.getElementById('formStatus');
    const data = {
      _subject: "Nouvelle demande reçue depuis le site de l'Étude",
      _template: 'table', _captcha: 'false', _honey: '',
      'Prénom': form.elements.prenom.value.trim(),
      'Nom': form.elements.nom.value.trim(),
      'Réponse souhaitée': preference.value === 'email' ? 'Par e-mail' : 'Par téléphone',
      'E-mail': email.value.trim(), 'Téléphone': phone.value.trim(),
      'Sujet': form.elements.sujet.value, 'Message': form.elements.message.value.trim()
    };
    if (email.value.trim()) data._replyto = email.value.trim();
    button.disabled = true; form.setAttribute('aria-busy', 'true');
    status.style.color = 'inherit'; status.textContent = 'Envoi en cours…';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch('https://formsubmit.co/ajax/c.diaz@notaires.fr', {
        method: 'POST', signal: controller.signal,
        headers: {'Content-Type': 'application/json', Accept: 'application/json'},
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Envoi refusé');
      const result = await response.json();
      if (result.success !== true && result.success !== 'true') throw new Error('Envoi refusé');
      status.style.color = '#246129';
      status.textContent = 'Merci, votre demande a bien été envoyée. L’Étude vous répondra sous deux jours ouvrés pour convenir du rendez-vous.';
      form.reset();
    } catch {
      status.style.color = '#B3261E';
      status.textContent = 'L’envoi n’a pas abouti. Votre message est conservé ici. Vous pouvez nous écrire à c.diaz@notaires.fr ou nous appeler au 04 77 71 33 07.';
    } finally {
      clearTimeout(timeout); button.disabled = false; form.setAttribute('aria-busy', 'false');
    }
  });
})();
