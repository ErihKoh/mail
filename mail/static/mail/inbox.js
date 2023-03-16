document.addEventListener('DOMContentLoaded', function () {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

async function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  const table_markup = document.querySelector('.table-body');

  // Show the mailbox name
  const emails_view = document.querySelector('#emails-view');
  // ======================== my code=========
  const response = await fetch_inbox_mails(mailbox);
  const markup = await create_markup(response);

  emails_view.insertAdjacentHTML(
    'beforebegin',
    `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`,
  );

  table_markup.innerHTML = markup;

  
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
