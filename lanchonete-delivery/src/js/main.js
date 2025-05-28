document.addEventListener('DOMContentLoaded', () => {
    const lanches = [
        { id: 1, nome: "Hamburguer", preco: 15.00 },
        { id: 2, nome: "X-Burguer", preco: 18.00 },
        { id: 3, nome: "X-Salada", preco: 20.00 },
        { id: 4, nome: "X-Bacon", preco: 25.00 },
        { id: 5, nome: "X-Egg", preco: 30.00 },
        { id: 6, nome: "X-Tudo", preco: 35.00 }
    ];

    const produtoSelect = document.getElementById('produtoSelect');
    if (produtoSelect) {
        produtoSelect.innerHTML = '<option value="">Selecione um produto</option>';
        lanches.forEach(lanche => {
            const option = document.createElement('option');
            option.value = lanche.nome;
            option.textContent = `${lanche.nome} - R$ ${lanche.preco.toFixed(2)}`;
            produtoSelect.appendChild(option);
        });
    }

    const orderForm = document.getElementById('pedidoForm');
    const orderList = document.getElementById('pedidosEmExecucao');
    const entregaList = document.getElementById('pedidosEmEntrega');
    const completedOrdersButton = document.getElementById('concluidosBtn');
    const tabelaFinalizados = document.getElementById('tabelaFinalizados');

    if (orderForm && orderList && entregaList) {
        updateOrderLists();

        orderForm.addEventListener('submit', (event) => {
            event.preventDefault();
            registerOrder();
        });

        if (completedOrdersButton) {
            completedOrdersButton.addEventListener('click', () => {
                window.location.href = 'pedidos-finalizados.html';
            });
        }
    }

    if (tabelaFinalizados) {
        renderFinalizadosTable();
    }

    function registerOrder() {
        const customerName = document.getElementById('clienteNome').value;
        const selectedProduct = document.getElementById('produtoSelect').value;
        const orderDate = new Date().toLocaleString();

        const order = {
            id: Date.now(),
            customerName,
            product: selectedProduct,
            date: orderDate,
            status: 'in-progress'
        };
        saveOrder(order);
        updateOrderLists();
        orderForm.reset();
    }

    function saveOrder(order) {
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
    }

    function updateOrderLists() {
        orderList.innerHTML = '';
        entregaList.innerHTML = '';
        const orders = JSON.parse(localStorage.getItem('orders')) || [];

        orders.filter(order => order.status === 'in-progress').forEach(order => {
            addOrderToList(order, orderList, 'toDelivery');
        });

        orders.filter(order => order.status === 'in-delivery').forEach(order => {
            addOrderToList(order, entregaList, 'finalize');
        });
    }

    function addOrderToList(order, container, buttonType) {
        const truckIcon = `<svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24"><path d="M17 16V5a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v11H0v2a1 1 0 0 0 1 1h1a3 3 0 0 0 6 0h6a3 3 0 0 0 6 0h1a1 1 0 0 0 1-1v-2h-3zm-2 0H7v-9h8zm-8 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm12 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3-2h-2v-5a1 1 0 0 0-1-1h-3V5h6z"/></svg>`;
        const checkIcon = `<svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24"><path d="M20.285 6.709a1 1 0 0 0-1.414 0l-8.285 8.285-3.285-3.285a1 1 0 1 0-1.414 1.414l4 4a1 1 0 0 0 1.414 0l9-9a1 1 0 0 0 0-1.414z"/></svg>`;

        let buttonHTML = '';
        let buttonAction = null;

        if (buttonType === 'toDelivery') {
            buttonHTML = `<button class="order-action" title="Mover para Entrega">${truckIcon}</button>`;
            buttonAction = () => moveToDelivery(order.id);
        } else if (buttonType === 'finalize') {
            buttonHTML = `<button class="order-action" title="Finalizar Pedido">${checkIcon}</button>`;
            buttonAction = () => finalizeOrder(order.id);
        }

        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <h3>${order.customerName}</h3>
            <p>Produto: ${order.product}</p>
            <p>Data: ${order.date}</p>
            ${buttonHTML}
        `;
        container.appendChild(orderCard);

        const actionButton = orderCard.querySelector('.order-action');
        if (actionButton) {
            actionButton.addEventListener('click', buttonAction);
        }
    }

    function moveToDelivery(orderId) {
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders = orders.map(order => {
            if (order.id === orderId) {
                order.status = 'in-delivery';
            }
            return order;
        });
        localStorage.setItem('orders', JSON.stringify(orders));
        updateOrderLists();
    }

    function finalizeOrder(orderId) {
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders = orders.map(order => {
            if (order.id === orderId) {
                order.status = 'finalizado';
            }
            return order;
        });
        localStorage.setItem('orders', JSON.stringify(orders));
        updateOrderLists();
    }

    function renderFinalizadosTable() {
        tabelaFinalizados.innerHTML = '';
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const finalizados = orders.filter(order => order.status === 'finalizado');
        if (finalizados.length === 0) {
            tabelaFinalizados.innerHTML = `<tr><td colspan="3">Nenhum pedido finalizado.</td></tr>`;
            return;
        }
        finalizados.forEach(order => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${order.customerName}</td>
                <td>${order.product}</td>
                <td>${order.date}</td>
            `;
            tabelaFinalizados.appendChild(tr);
        });
    }
});