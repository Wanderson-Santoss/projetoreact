import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    Container, Card, Form, Button, Alert, Spinner, InputGroup
} from 'react-bootstrap';
// Importe os ícones do react-bootstrap-icons
import { 
    PlusCircleFill, PencilSquare, XCircle, Tools, 
    GeoAlt, CashCoin, TagFill, FileText, 
    Lightning, Hammer, Wrench, Cake, DropletFill, 
    Scissors, CodeSlash, HouseDoor, Truck 
} from 'react-bootstrap-icons'; 

// 🚨 Mapeamento EXPANDIDO e PADRONIZADO (use nomes de serviços em minúsculas, sem acentos)
// *************** CERTIFIQUE-SE DE QUE OS NOMES AQUI CORRESPONDEM AOS NOMES DA SUA API! ****************
const ICON_MAP = {
    'eletricista': { Icon: Lightning, color: 'text-warning' },
    'encanador': { Icon: DropletFill, color: 'text-info' },
    'construcao': { Icon: Hammer, color: 'text-danger' },
    'mecanico': { Icon: Wrench, color: 'text-success' },
    'confeiteira': { Icon: Cake, color: 'text-pink' },
    'cabeleireiro': { Icon: Scissors, color: 'text-purple' },
    'costureira': { Icon: CodeSlash, color: 'text-cyan' },
    'limpeza': { Icon: HouseDoor, color: 'text-light' }, 
    'frete': { Icon: Truck, color: 'text-orange' }, // Novo!
    'montagem': { Icon: Tools, color: 'text-secondary' }, // Exemplo para Montagem de Móveis
    'geral': { Icon: Tools, color: 'text-muted' }, // Ícone genérico de fallback
};

const CreateDemand = ({ isEditMode = false }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    
    // Endpoints (mantidos)
    const SERVICES_URL = '/api/v1/servicos/';
    const DEMANDAS_URL = '/api/v1/demandas/';

    const [services, setServices] = useState([]); 
    const [formData, setFormData] = useState({
        service: '', 
        titulo: '',
        descricao: '',
        cep: '',
        endereco_aproximado: '',
        valor: '', 
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    // --- Lógica de Carregamento e Edição (Mantida) ---
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await axios.get(SERVICES_URL);
                setServices(response.data);
            } catch (err) {
                console.error("Erro ao carregar serviços:", err);
            }
        };
        fetchServices();

        if (isEditMode && id) {
            const fetchDemandData = async () => {
                try {
                    setLoading(true);
                    const response = await axios.get(`${DEMANDAS_URL}${id}/`);
                    const demand = response.data;
                    
                    setFormData({
                        service: demand.service,
                        titulo: demand.titulo,
                        descricao: demand.descricao,
                        cep: demand.cep,
                        endereco_aproximado: demand.endereco_aproximado || '',
                        valor: demand.valor || '', 
                    });

                    // Bloqueia edição (mantido)
                    if (demand.status !== 'aberto' && demand.status !== 'pendente') {
                        setError(`Esta demanda está com status "${demand.status}" e não pode ser editada.`);
                    }

                } catch (err) {
                    setError("Não foi possível carregar os dados desta demanda. Verifique se você é o cliente e se o ID está correto.");
                } finally {
                    setLoading(false);
                }
            };
            fetchDemandData();
        }
    }, [id, isEditMode]);


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCancel = () => {
        navigate('/meu-perfil'); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (!formData.service || !formData.titulo || !formData.descricao || !formData.cep) {
            setError("Por favor, preencha todos os campos obrigatórios.");
            setLoading(false);
            return;
        }

        try {
            const url = isEditMode ? `${DEMANDAS_URL}${id}/` : DEMANDAS_URL;
            const method = isEditMode ? axios.patch : axios.post; 

            const dataToSend = {
                ...formData,
                valor: formData.valor ? parseFloat(formData.valor) : null
            };

            await method(url, dataToSend);

            setSuccess(`Demanda ${isEditMode ? 'atualizada' : 'criada'} com sucesso! Você será redirecionado(a).`);
            
            setTimeout(() => {
                navigate('/meu-perfil');
            }, 2000);

        } catch (err) {
            // ... (Lógica de tratamento de erro mantida)
            let errorMessage = `Falha ao ${isEditMode ? 'atualizar' : 'criar'} demanda. Tente novamente.`;
            if (err.response && err.response.data) {
                 if (err.response.data.detail) {
                     errorMessage = err.response.data.detail;
                 } else if (err.response.data.status) {
                     errorMessage = err.response.data.status[0];
                 } else {
                     errorMessage = Object.entries(err.response.data)
                         .map(([key, value]) => `${key.toUpperCase()}: ${Array.isArray(value) ? value.join(', ') : value}`)
                         .join(' | ');
                 }
            }
            setError(errorMessage);

        } finally {
            setLoading(false);
        }
    };

    const pageTitle = isEditMode ? 'Editar Demanda Existente' : 'Criar Nova Demanda';
    const submitText = isEditMode ? 'Atualizar Demanda' : 'Publicar Demanda';
    const MainIcon = isEditMode ? PencilSquare : PlusCircleFill;
    
    // Lógica para obter o ícone e a cor do serviço selecionado
    const selectedService = services.find(s => s.id == formData.service);
    const selectedServiceKey = selectedService ? selectedService.name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'geral';
    const { Icon: SelectedIconComponent, color: selectedColor } = ICON_MAP[selectedServiceKey] || ICON_MAP['geral'];


    return (
        <Container className="my-5">
            {/* Card com Dark Mode e Sombra */}
            <Card className="bg-dark text-white border-0 shadow-lg">
                <Card.Header className="bg-primary text-center py-3">
                    <h2 className="mb-0 text-white fw-bold">
                        <MainIcon className="me-2" /> {pageTitle}
                    </h2>
                </Card.Header>

                <Card.Body>
                    {/* Mensagens de Feedback */}
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}
                    {loading && !error && (
                        <div className="text-center my-3"><Spinner animation="border" variant="primary" /><p className="text-white-50 mt-2">Carregando...</p></div>
                    )}

                    <Form onSubmit={handleSubmit}>
                        
                        {/* 1. SELEÇÃO DE SERVIÇO (VOLTANDO AO DROPDOWN COM ÍCONE DINÂMICO) */}
                        <Form.Group className="mb-4">
                            <Form.Label className="text-white fw-bold fs-5">
                                Qual serviço você precisa? <span className="text-danger">*</span>
                            </Form.Label>
                            
                            <InputGroup>
                                {/* Ícone dinâmico do serviço selecionado */}
                                <InputGroup.Text className={`bg-secondary border-dark ${selectedColor}`}>
                                    <SelectedIconComponent size={20} />
                                </InputGroup.Text>
                                
                                <Form.Control 
                                    as="select"
                                    name="service"
                                    value={formData.service}
                                    onChange={handleChange}
                                    className="bg-secondary text-white border-dark" // Estilização Dark Mode
                                    required
                                >
                                    <option value="" disabled>Selecione o tipo de serviço...</option>
                                    {/* Mapeamento dos serviços da API */}
                                    {services.map(service => (
                                        <option key={service.id} value={service.id}>
                                            {service.name}
                                        </option>
                                    ))}
                                </Form.Control>
                            </InputGroup>
                            <small className="text-white-50">Escolha a categoria que melhor se encaixa na sua necessidade.</small>
                        </Form.Group>

                        <hr className="my-4 border-secondary" />

                        {/* 2. Título (Com InputGroup e Ícone) */}
                        <Form.Group className="mb-3">
                            <Form.Label className="text-white-50">Título <span className="text-danger">*</span></Form.Label>
                            <InputGroup>
                                <InputGroup.Text className="bg-secondary border-dark text-white"><TagFill size={20} /></InputGroup.Text>
                                <Form.Control 
                                    type="text" 
                                    name="titulo"
                                    placeholder="Ex: Troca de disjuntor na cozinha"
                                    value={formData.titulo}
                                    onChange={handleChange}
                                    className="bg-secondary text-white border-dark"
                                    maxLength={100}
                                    required
                                />
                            </InputGroup>
                        </Form.Group>

                        {/* 3. Descrição (Com InputGroup e Ícone) */}
                        <Form.Group className="mb-3">
                            <Form.Label className="text-white-50">Descrição Detalhada <span className="text-danger">*</span></Form.Label>
                            <InputGroup>
                                <InputGroup.Text className="bg-secondary border-dark text-white"><FileText size={20} /></InputGroup.Text>
                                <Form.Control 
                                    as="textarea" 
                                    name="descricao"
                                    rows={4}
                                    placeholder="Detalhe o problema, inclua horários de preferência e informações importantes."
                                    value={formData.descricao}
                                    onChange={handleChange}
                                    className="bg-secondary text-white border-dark"
                                    required
                                />
                            </InputGroup>
                        </Form.Group>

                        {/* 4. CEP (Com InputGroup e Ícone) */}
                        <Form.Group className="mb-3">
                            <Form.Label className="text-white-50">CEP (Local do Serviço) <span className="text-danger">*</span></Form.Label>
                            <InputGroup>
                                <InputGroup.Text className="bg-secondary border-dark text-white"><GeoAlt size={20} /></InputGroup.Text>
                                <Form.Control 
                                    type="text" 
                                    name="cep"
                                    placeholder="Apenas números. Ex: 00000-000"
                                    value={formData.cep}
                                    onChange={handleChange}
                                    className="bg-secondary text-white border-dark"
                                    maxLength={9}
                                    required
                                />
                            </InputGroup>
                        </Form.Group>

                        {/* 5. VALOR ESTIMADO (OPCIONAL) (Com InputGroup e Ícone) */}
                        <Form.Group className="mb-3">
                            <Form.Label className="text-white-50">Valor Estimado (R$)</Form.Label>
                            <InputGroup>
                                <InputGroup.Text className="bg-secondary border-dark text-white"><CashCoin size={20} /></InputGroup.Text>
                                <Form.Control 
                                    type="number" 
                                    name="valor"
                                    placeholder="Deixe em branco para receber propostas"
                                    value={formData.valor}
                                    onChange={handleChange}
                                    className="bg-secondary text-white border-dark"
                                    min="0"
                                />
                            </InputGroup>
                            <Form.Text className="text-white-50">
                                Se preenchido, será o valor máximo que você está disposto(a) a pagar.
                            </Form.Text>
                        </Form.Group>

                        {/* 6. Endereço Aproximado (Opcional) */}
                        <Form.Group className="mb-4">
                            <Form.Label className="text-white-50">Ponto de Referência/Endereço Aproximado</Form.Label>
                            <InputGroup>
                                <InputGroup.Text className="bg-secondary border-dark text-white"><HouseDoor size={20} /></InputGroup.Text>
                                <Form.Control 
                                    type="text" 
                                    name="endereco_aproximado"
                                    placeholder="Ex: Perto da praça central, casa verde"
                                    value={formData.endereco_aproximado}
                                    onChange={handleChange}
                                    className="bg-secondary text-white border-dark"
                                    maxLength={255}
                                />
                            </InputGroup>
                        </Form.Group>

                        {/* Botões de Ação */}
                        <div className="d-flex justify-content-between gap-3 pt-3 border-top border-secondary">
                            <Button
                                type="button"
                                variant="secondary"
                                className="fw-bold py-2 flex-grow-1"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                <XCircle className="me-2" /> Cancelar
                            </Button>
                            
                            <Button 
                                type="submit" 
                                className="fw-bold py-2 flex-grow-1"
                                variant="primary" 
                                disabled={loading}
                            >
                                {loading ? <Spinner animation="border" size="sm" /> : submitText}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default CreateDemand;