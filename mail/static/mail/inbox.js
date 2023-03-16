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
  table_markup: document.querySelector('.table-body'),
};

document.addEventListener('DOMContentLoaded', function () {
  // Use buttons to toggle between views
  refs.inbox.addEventListener('click', () => load_mailbox('inbox'));
  refs.sent.addEventListener('click', () => load_mailbox('sent'));
  refs.archived.addEventListener('click', () => load_mailbox('archive'));
  refs.compose.addEventListener('click', compose_email);

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
  const markup = emails.map((el) => {
    const result = `<tr><td>${el.sender}</td><td>${el.subject}</td><td>${el.timestamp}</td></tr>`;
    return result;
  });
  return markup.join('');
}

async function send_email() {}
