const refs = {
  inbox: document.querySelector('#inbox'),
  sent: document.querySelector('#sent'),
  archived: document.querySelector('#archived'),
  compose: document.querySelector('#compose'),
  email_view: document.querySelector('#emails-view'),
  compose_view: document.querySelector('#compose-view'),
  compose_recipients: document.querySelector('#compose-recipients'),
  compose_subject: document.querySelector('#compose-subject'),
  compose_body: document.querySelector('#compose-body'),
  table_markup: document.querySelector('#emails-list'),
  compose_form: document.querySelector('#compose-form'),
};

document.addEventListener('DOMContentLoaded', function () {
  // Use buttons to toggle between views
  refs.inbox.addEventListener('click', () => load_mailbox('inbox'));
  refs.sent.addEventListener('click', () => load_mailbox('sent'));
  refs.archived.addEventListener('click', () => load_mailbox('archive'));
  refs.compose.addEventListener('click', compose_email);
  refs.compose_form.addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  // Show compose view and hide other views
  refs.email_view.style.display = 'none';
  refs.compose_view.style.display = 'block';

  // Clear out composition fields
  refs.compose_recipients.value = '';
  refs.compose_subject.value = '';
  refs.compose_body.value = '';
}

async function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  refs.email_view.style.display = 'block';
  refs.compose_view.style.display = 'none';

  // Show the mailbox name

  // ======================== my code=========

  const response = await fetch_inbox_mails(mailbox);
  const markup = await create_markup(response);
  const name_folder = `<h3 class="mb-5">${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  refs.table_markup.innerHTML = name_folder + markup;
  create_btn_delete();
}

// ===============================================================================

async function fetch_inbox_mails(mailbox) {
  try {
    const response = await fetch(`/emails/${mailbox}`);

    return await response.json();
  } catch (error) {
    console.log(error);
  }
}

function create_markup(emails) {
  try {
    const markup = emails.map((el) => {
      const result = `<li class='clickable-row container align-items-center'>
        <div class='row'>
        <a href='emails/${el.id}' class='col d-flex flex-row justify-content-between text'>
        <p>${el.sender}</p>
        <p>${el.subject}</p>
        <p>${el.timestamp}</p>
          </a>
        <div class='col-md-auto'><button type='button' class="btn btn-warning">edit</button></div>
        <div class='col col-lg-2'><button data-id=${el.id} type='button' class="btn btn-danger btn-del">delete</button></div>
      </div>
        </li>`;

      return result;
    });
    return markup.join('');
  } catch (error) {
    console.log(error);
  }
}

async function send_email(event) {
  event.preventDefault();
  try {
    const sendingData = {};
    const formData = new FormData(refs.compose_form);
    for (let [name, value] of formData) {
      sendingData[name] = value;
    }

    const response = await fetch('/emails', {
      method: 'POST',
      body: JSON.stringify(sendingData),
    });
    const result = await response.json();
    alert('Email sent successfully.');
    compose_email();
    return result;
  } catch (error) {
    console.log(error);
  }
}

function create_btn_delete() {
  return document.querySelectorAll('.btn-del').forEach((btn) => {
    btn.addEventListener('click', async (evt) => {
      await fetch(`/emails/${btn.dataset.id}`, {
        method: 'DELETE',
      });
      location.reload(true);
      alert(`Message has deleted`);
    });
  });
}
