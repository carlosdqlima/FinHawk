import React, { useEffect, useState } from 'react';
import './contasPagas.css';

const ContasPagas = () => {
    const [dados, setDados] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [filterCategoria, setFilterCategoria] = useState('');
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');

    const fetchDados = async () => {
        try {
            const token = localStorage.getItem('token');
            const idConta = localStorage.getItem('id');

            // Alteração na URL - agora busca títulos PAGOS
            const response = await fetch(`http://localhost:8080/titulos/pagos?contaId=${idConta}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar dados');
            }

            const data = await response.json();
            setDados(data);
            setError(null);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            setError(error.message);
        }
    };

    const fetchCategorias = async () => {
        try {
            const token = localStorage.getItem('token');
            const tipo = 'Pagamento';

            const response = await fetch(`http://localhost:8080/categorias?tipo=${tipo}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Falha ao carregar categorias.');
            }
            const data = await response.json();

            setCategorias(data);
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
        }
    };

    useEffect(() => {
        fetchDados();
        fetchCategorias();
    }, []);

    const handleFilterStartDateChange = (event) => {
        setFilterStartDate(event.target.value);
    };

    const handleFilterEndDateChange = (event) => {
        setFilterEndDate(event.target.value);
    };

    const handleFilterCategoriaChange = (event) => {
        setFilterCategoria(event.target.value);
    };

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const filteredData = dados.filter((item) => {
        const itemVenc = new Date(item.vencimento);
        const startDate = filterStartDate ? new Date(filterStartDate) : null;
        const endDate = filterEndDate ? new Date(filterEndDate) : null;

        const categoriaMatch = !filterCategoria || item.categoria.nome === filterCategoria;

        const dateMatch = (!startDate || itemVenc >= startDate) && (!endDate || itemVenc <= endDate);

        return dateMatch && categoriaMatch;
    });

    // Ordenação dos dados
    let sortedData = [...filteredData];
    if (sortBy) {
        sortedData.sort((a, b) => {
            let aValue, bValue;

            if (sortBy === 'id' || sortBy === 'valor') {
                aValue = Number(a[sortBy]);
                bValue = Number(b[sortBy]);
            } else if (sortBy === 'emissao' || sortBy === 'vencimento') {
                aValue = new Date(a[sortBy]);
                bValue = new Date(b[sortBy]);
            } else if (sortBy === 'categoria') {
                aValue = a.categoria.nome.toLowerCase();
                bValue = b.categoria.nome.toLowerCase();
            } else {
                aValue = a[sortBy].toLowerCase();
                bValue = b[sortBy].toLowerCase();
            }

            if (aValue < bValue) {
                return sortOrder === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortOrder === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }

    const totalValor = sortedData.reduce((total, item) => total + Number(item.valor), 0);

    return (
        <div className='rel-pagas-container'>
            <div className='titulo-contas-pagas'>
                <h1>Relatório de Contas Pagas</h1>
            </div>

            <div className='filter-rel-container'>
                <label htmlFor="startDate" className='rel-white-label'>Data Inicial:</label>
                <input
                    type="date"
                    className="form-control no-inner-shadow"
                    id="startDate"
                    value={filterStartDate}
                    onChange={handleFilterStartDateChange}
                />
                <label htmlFor="endDate" className="rel-white-label">Data Final:</label>
                <input
                    type="date"
                    className="form-control no-inner-shadow"
                    id="endDate"
                    value={filterEndDate}
                    onChange={handleFilterEndDateChange}
                />
                <label htmlFor="categoria" className="rel-white-label">Categoria:</label>
                <select
                    className="form-control no-inner-shadow"
                    id="categoria"
                    value={filterCategoria}
                    onChange={handleFilterCategoriaChange}
                >
                    <option value="">Todas</option>
                    {categorias.map((categoria) => (
                        <option key={categoria.id} value={categoria.nome}>
                            {categoria.nome}
                        </option>
                    ))}
                </select>
            </div>

            <div className="relatorio-box">
                <div className="cabecalho-container">
                    <p>
                        <strong>Período: </strong>
                        {filterStartDate && filterEndDate
                            ? `${new Date(filterStartDate).toLocaleDateString('pt-BR')} a ${new Date(filterEndDate).toLocaleDateString('pt-BR')}`
                            : ' Nenhum período selecionado'}
                    </p>
                    <p>
                        <strong>Data de Geração:</strong> {new Date().toLocaleString('pt-BR')}
                    </p>
                </div>

                <table className="rel-table-hover">
                    <thead>
                        <tr>
                            <th scope="col" onClick={() => handleSort('id')}>
                                Núm. Doc.
                                {sortBy === 'id' && (sortOrder === 'asc' ? ' ▲' : ' ▼')}
                            </th>
                            <th scope="col" onClick={() => handleSort('descricao')}>
                                Descrição
                                {sortBy === 'descricao' && (sortOrder === 'asc' ? ' ▲' : ' ▼')}
                            </th>
                            <th scope="col" onClick={() => handleSort('emissao')}>
                                Data Emissão
                                {sortBy === 'emissao' && (sortOrder === 'asc' ? ' ▲' : ' ▼')}
                            </th>
                            <th scope="col" onClick={() => handleSort('vencimento')}>
                                Venc.
                                {sortBy === 'vencimento' && (sortOrder === 'asc' ? ' ▲' : ' ▼')}
                            </th>
                            <th scope="col" onClick={() => handleSort('categoria')}>
                                Categoria
                                {sortBy === 'categoria' && (sortOrder === 'asc' ? ' ▲' : ' ▼')}
                            </th>
                            <th scope="col" onClick={() => handleSort('valor')}>
                                Valor Título (R$)
                                {sortBy === 'valor' && (sortOrder === 'asc' ? ' ▲' : ' ▼')}
                            </th>
                            <th scope="col">Parcela</th> {/* Adicionar esta linha */}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map((item) => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.descricao}</td>
                                <td>{new Date(item.emissao).toLocaleDateString('pt-BR')}</td>
                                <td>{new Date(item.vencimento).toLocaleDateString('pt-BR')}</td>
                                <td>{item.categoria.nome}</td>
                                <td>{Number(item.valor).toFixed(2).replace('.', ',')}</td>
                                <td>{item.numeroParcela || 1}/{item.quantidadeParcelas || 1}</td> { }
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="totalizador-container">
                    <span>Total Pago: R$ {totalValor.toFixed(2).replace('.', ',')}</span>
                </div>
            </div>
        </div>
    );
};

export default ContasPagas;