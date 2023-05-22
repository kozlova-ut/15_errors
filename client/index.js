export async function createApp(container) {
  let attempt = 1;
  const spinner = createSpinner();
  const alertBar = createAlertBar();
  document.body.append(spinner);
  document.body.append(alertBar);

  container.classList.add('container', 'd-flex', 'flex-wrap', 'justify-content-between', 'py-5');

  await createProductList(container, spinner, alertBar, attempt);
}

async function createProductList(container, spinner, alertBar, attempt) {
  const products = await getProductsList(container, spinner, alertBar, attempt);

  Promise.all(products.map(item => {
    const product = createProduct(item);
    return product;
  })).then(data => {
    spinner.style.display = 'none';
    data.map(d => container.append(d));
  })
}

function getProductsList(container, spinner, alertBar, attempt) {
    const products = fetch('http://localhost:3000/api/products')
      .then(res => {
        if (res.status === 500) {
          const error = new Error();
          error.code = '500';
          throw error;
        }
        else if (res.status === 404) {
          const error = new Error();
          error.code = '404';
          throw error;
        }
        else {
          return res.json();
        }
      })
      .then(res => {
        return res.products;
      })
      .catch(error => {
        console.log(error);
        let alert;
        switch (error.code) {
          case '500':
            if (attempt === 1) {
              attempt +=1;
              createProductList(container, spinner, alertBar, attempt);
            }
            else {
              attempt = 1;
              alert = createAlert('Произошла ошибка, попробуйте обновить страницу позже');
              alertBar.prepend(alert);
              setTimeout(() => {
                alert.remove();
              }, 3000);
            }
            break;
          case '404':
            const heading = document.createElement('h1');
            heading.style.width = '100%';
            heading.style.textAlign = 'center';
            heading.textContent = 'Список товаров пуст';
            document.getElementById('app').append(heading);
            break;
          default:
            alert = createAlert('Произошла ошибка, попробуйте обновить страницу позже');
            alertBar.prepend(alert);
            setTimeout(() => {
              alert.remove();
            }, 3000);
        }
      })
      .finally(() => {
        spinner.style.display = 'none';
      })
    return products;
}

function createProduct(item) {
  const product = document.createElement('div');
  const productContent = document.createElement('div');
  const productImage = document.createElement('img');
  const productTitle = document.createElement('h3');
  const productPrice = document.createElement('a');
  product.classList.add('card', 'mb-4');

  product.style.width = '32%';
  productContent.classList.add('card-body', 'd-flex', 'flex-column', 'justify-content-between');
  productImage.src = item.image;
  productTitle.textContent = item.name;
  productPrice.classList.add('btn', 'btn-primary', 'mt-3');
  productPrice.textContent = item.price;

  const promise = new Promise (resolve => {
    productImage.addEventListener('load', () => resolve());
  }).then(() => {
    productContent.append(productTitle);
    productContent.append(productPrice);
    product.append(productImage);
    product.append(productContent);
    return product;
  })
  return promise;
}

function createSpinner() {
  const wrapper = document.createElement('div');
  const spinner = document.createElement('div');

  wrapper.classList.add('mt-5');
  wrapper.style.textAlign = 'center';
  spinner.classList.add('spinner-border');

  wrapper.append(spinner);

  wrapper.style.display = 'block';
  return wrapper;
}

function createAlertBar() {
  const alertBar = document.createElement('div');
  alertBar.classList.add('d-flex', 'flex-column', 'justify-content-end');
  alertBar.style.position = 'fixed';
  alertBar.style.right = '0';
  alertBar.style.top = '0';
  alertBar.style.height = '100vh';
  alertBar.style.width = '30%';
  alertBar.style.padding = '0px 10px'
  alertBar.style.pointerEvents = 'none';
  return alertBar;
}

function createAlert(message) {
  const alert = document.createElement('div');
  alert.classList.add('alert', 'alert-danger');
  alert.textContent = message;
  return alert;
}

