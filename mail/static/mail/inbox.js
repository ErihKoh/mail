{
  /* <div class='col col-lg-2'><button data-id=${el.id} type='button' class="btn btn-danger btn-del">delete</button></div> */
}

const refs = {
  inbox: document.querySelector('#inbox'),
  sent: document.querySelector('#sent'),
  archived: document.querySelector('#archived'),
  compose: document.querySelector('#compose'),
  emails_view: document.querySelector('#emails-view'),
  compose_view: document.querySelector('#compose-view'),
  email_view: document.querySelector('#email-view'),
  compose_recipients: document.querySelector('#compose-recipients'),
  compose_subject: document.querySelector('#compose-subject'),
  compose_body: document.querySelector('#compose-body'),
  emails_list: document.querySelector('#emails-list'),
  compose_form: document.querySelector('#compose-form'),
};

document.addEventListener('DOMContentLoaded', function () {
  // Use buttons to toggle between views
  refs.inbox.addEventListener('click', () => load_mailbox('inbox'));
  refs.sent.addEventListener('click', () => load_mailbox('sent'));
  refs.archived.addEventListener('click', () => load_mailbox('archive'));
  refs.compose.addEventListener('click', compose_email);
  refs.compose_form.addEventListener('submit', send_email);
  refs.emails_list.addEventListener('click', (evt) => {
    let item = evt.target.closest('li');
    if ((item && evt.target.tagName === 'DIV') || evt.target.tagName === 'P') {
      email_load(item.dataset.id);
    }
  });

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  // Show compose view and hide other views
  refs.emails_view.style.display = 'none';
  refs.email_view.style.display = 'none';
  refs.compose_view.style.display = 'block';

  // Clear out composition fields
  refs.compose_recipients.value = '';
  refs.compose_subject.value = '';
  refs.compose_body.value = '';

  localStorage.removeItem('for_reply');
}

async function email_load(id) {
  refs.emails_view.style.display = 'none';
  refs.compose_view.style.display = 'none';
  refs.email_view.style.display = 'block';

  const response = await fetch_email(id);
  const markup = create_markup_email(response);
  refs.email_view.innerHTML = markup;

  const reply_btn = document.querySelector('#reply');

  if (response.sender === refs.email_view.dataset.user) {
    reply_btn.remove();
  }

  localStorage.setItem('for_reply', JSON.stringify(response));
}

async function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  refs.emails_view.style.display = 'block';
  refs.compose_view.style.display = 'none';
  refs.email_view.style.display = 'none';

  // Show the mailbox name

  // ======================== my code=========

  const response = await fetch_inbox_mails(mailbox);
  const markup = await create_markup_mailbox(response);
  const name_folder = `<h3 class="mb-5">${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  refs.emails_list.innerHTML = name_folder + markup;
  add_class_for_unread_email();
  create_block_btn('.btn-appr');
  create_btn_delete();
  localStorage.removeItem('for_reply');
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

async function fetch_email(id) {
  try {
    const response = await fetch(`/emails/${id}`);
    return await response.json();
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
    load_mailbox('sent');
    return result;
  } catch (error) {
    console.log(error);
  }
}

function create_markup_mailbox(emails) {
  const markup = emails.map(
    (
      el,
    ) => `<li class='clickable-row container' data-id=${el.id} data-read=${el.read} data-archived=${el.archived}>
        <div class='row'>
        <div class='col-8 d-flex flex-row justify-content-between text'>
        <p>${el.sender}</p>
        <p>${el.subject}</p>
        <p>${el.timestamp}</p>
          </div>
        <div class='col-4 d-flex flex-row justify-content-around btn-appr' data-read=${el.read} data-archived=${el.archived} data-id=${el.id}></div> 
      </div>
        </li>`,
  );
  return markup.join('');
}

function create_btn_delete() {
  return document.querySelectorAll('.btn-del').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await fetch(`/emails/${btn.dataset.id}`, {
        method: 'DELETE',
      });
      location.reload(true);
    });
  });
}

function create_btn_del_markup(id_elm) {
  return `<button type='button' class="btn-left btn-del" data-id=${id_elm}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                      <path d="M16 1.75V3h5.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H8V1.75C8 .784 8.784 0 9.75 0h4.5C15.216 0 16 .784 16 1.75Zm-6.5 0V3h5V1.75a.25.25 0 0 0-.25-.25h-4.5a.25.25 0 0 0-.25.25ZM4.997 6.178a.75.75 0 1 0-1.493.144L4.916 20.92a1.75 1.75 0 0 0 1.742 1.58h10.684a1.75 1.75 0 0 0 1.742-1.581l1.413-14.597a.75.75 0 0 0-1.494-.144l-1.412 14.596a.25.25 0 0 1-.249.226H6.658a.25.25 0 0 1-.249-.226L4.997 6.178Z"></path><path d="M9.206 7.501a.75.75 0 0 1 .793.705l.5 8.5A.75.75 0 1 1 9 16.794l-.5-8.5a.75.75 0 0 1 .705-.793Zm6.293.793A.75.75 0 1 0 14 8.206l-.5 8.5a.75.75 0 0 0 1.498.088l.5-8.5Z">
                      </path>
                    </svg>
                  </button>`;
}

function create_btn_archive_markup() {
  return `<button type='button' class='btn-left '>
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'>
        <path d='M2.75 2h18.5c.966 0 1.75.784 1.75 1.75v3.5A1.75 1.75 0 0 1 21.25 9H2.75A1.75 1.75 0 0 1 1 7.25v-3.5C1 2.784 1.784 2 2.75 2Zm18.5 1.5H2.75a.25.25 0 0 0-.25.25v3.5c0 .138.112.25.25.25h18.5a.25.25 0 0 0 .25-.25v-3.5a.25.25 0 0 0-.25-.25ZM2.75 10a.75.75 0 0 1 .75.75v9.5c0 .138.112.25.25.25h16.5a.25.25 0 0 0 .25-.25v-9.5a.75.75 0 0 1 1.5 0v9.5A1.75 1.75 0 0 1 20.25 22H3.75A1.75 1.75 0 0 1 2 20.25v-9.5a.75.75 0 0 1 .75-.75Z'></path>
        <path d='M9.75 11.5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-4.5Z'></path>
      </svg>
    </button>`;
}

function create_btn_unarchive_markup() {
  return `<button type='button' class='btn-left '>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
      <path d="M5 2.5a.5.5 0 0 0-.5.5v18a.5.5 0 0 0 .5.5h1.75a.75.75 0 0 1 0 1.5H5a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h9.982a2 2 0 0 1 1.414.586l4.018 4.018A2 2 0 0 1 21 7.018V21a2 2 0 0 1-2 2h-2.75a.75.75 0 0 1 0-1.5H19a.5.5 0 0 0 .5-.5V7.018a.5.5 0 0 0-.146-.354l-4.018-4.018a.5.5 0 0 0-.354-.146H5Z"></path><path d="M11.5 15.75a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1-.75-.75Zm.75-3.75a.75.75 0 0 0 0 1.5h1a.75.75 0 0 0 0-1.5h-1Zm-.75-2.25a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1-.75-.75ZM12.25 6a.75.75 0 0 0 0 1.5h1a.75.75 0 0 0 0-1.5h-1Zm-.75-2.25a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1-.75-.75ZM9.75 13.5a.75.75 0 0 0 0 1.5h1a.75.75 0 0 0 0-1.5h-1ZM9 11.25a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1-.75-.75Zm.75-3.75a.75.75 0 0 0 0 1.5h1a.75.75 0 0 0 0-1.5h-1ZM9 5.25a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1A.75.75 0 0 1 9 5.25ZM11 17h1a2 2 0 0 1 2 2v4.25a.75.75 0 0 1-.75.75h-3.5a.75.75 0 0 1-.75-.75V19a2 2 0 0 1 2-2Zm-.5 2v3.5h2V19a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5Z">
      </path>
      </svg>
    </button>`;
}

function create_btn_read_markup() {
  return `<button type='button' class="btn-left">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <path d="M10.89 1.767a2.252 2.252 0 0 1 2.22 0l9.75 5.525A2.25 2.25 0 0 1 24 9.249v9.501A2.25 2.25 0 0 1 21.75 21H2.25A2.25 2.25 0 0 1 0 18.75v-9.5c0-.81.435-1.558 1.14-1.958Zm1.48 1.305a.75.75 0 0 0-.74 0l-9.316 5.28 7.41 4.233a3.75 3.75 0 0 1 4.553 0l7.41-4.234-9.317-5.28ZM20.65 19.5l-7.26-5.704a2.25 2.25 0 0 0-2.78 0L3.35 19.5Zm1.85-9.886-6.95 3.971 6.663 5.236c.089.07.161.159.21.26a.745.745 0 0 0 .077-.331ZM8.45 13.585 1.5 9.614v9.136c0 .119.028.23.076.33a.744.744 0 0 1 .21-.259Z">
        </path>
        </svg>
        </button>`;
}

function create_btn_unread_markup() {
  return `<button type='button' class="btn-left">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M1.75 4.5a.25.25 0 0 0-.25.25v.852l10.36 7a.25.25 0 0 0 .28 0l5.69-3.845A.75.75 0 0 1 18.67 10l-5.69 3.845c-.592.4-1.368.4-1.96 0L1.5 7.412V19.25c0 .138.112.25.25.25h20.5a.25.25 0 0 0 .25-.25v-8.5a.75.75 0 0 1 1.5 0v8.5A1.75 1.75 0 0 1 22.25 21H1.75A1.75 1.75 0 0 1 0 19.25V4.75C0 3.784.784 3 1.75 3h15.5a.75.75 0 0 1 0 1.5H1.75Z"></path><path d="M24 5.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z">
        </path>
        </svg>
        </button>`;
}

function create_block_btn(selector) {
  const del = create_btn_del_markup;
  const archived = create_btn_archive_markup();
  const unarchived = create_btn_unarchive_markup();
  const read = create_btn_read_markup();
  const unread = create_btn_unread_markup();
  return Array.from(document.querySelectorAll(selector)).map((el) => {
    el.insertAdjacentHTML('afterbegin', del(el.dataset.id));

    el.dataset.archived === 'false'
      ? el.insertAdjacentHTML('afterbegin', archived)
      : el.insertAdjacentHTML('afterbegin', unarchived);

    el.dataset.read === 'false'
      ? el.insertAdjacentHTML('afterbegin', read)
      : el.insertAdjacentHTML('afterbegin', unread);
  });
}

function add_class_for_unread_email() {
  return Array.from(document.querySelectorAll('.clickable-row')).map((el) =>
    el.dataset.read === 'false' ? el.classList.add('row-bgc') : el.classList.remove('row-bgc'),
  );
}

function create_markup_email(email) {
  return `<div>
          <p><b>From: </b>${email.sender}</p>
          <p><b>To: </b>${email.recipients}</p>
          <p><b>Subject: </b>${email.subject}</p>
          <p><b>To: </b>${email.timestamp}</p>
          <button class="btn btn-sm btn-outline-primary" id="reply">Reply</button>
          <hr/>
          <p>${email.body}</p>
        </div>`;
}

function reply() {}
