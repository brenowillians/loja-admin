import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Grid from '@mui/material/Grid';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, FormControl, FormControlLabel, FormHelperText, LinearProgress, Switch, Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import http from '../../utils/http'
import Checkbox from '@mui/material/Checkbox';
import Snackbar from '@mui/material/Snackbar';
import { DataRule } from '../rule';
import { useAuth } from '@/hooks/useAuth';
import ViewStaffComponent from './components/view';



export interface DataStaff {
    idStaff?: number;
    name: string ;
    login: string;
    id_number: string;
    cpf: string;
    password: string;
    active: boolean ;
    locked: boolean;
    sector: string;
    role: string;
    ctps: string;
    phone: string;
    mobile: string;
    
}

export default function StickyHeadTable() {
  //const defaultValues: Data[] = []

  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [snackMessage, setSnackMessage] = React.useState('');
  const [reload, setReload] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [rules, setRules] = React.useState<DataRule[]>([])
  const [search, setSearch] = React.useState('');
  const [staffs, setStaffs] =React.useState<DataStaff[]>([])
  const [staff, setStaff] =React.useState<DataStaff>({
    idStaff: 0,
    name: '' ,
    login: '',
    cpf:'',
    id_number:'',
    password: '',
    active: false ,
    locked: false,
    sector: '',
    role: '',
    ctps: '',
    phone: '',
    mobile: ''
  })
  const [total, setTotal] = React.useState(0);
  const auth = useAuth()
 

  
    


    

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
//função que muda a página das listagens de produtos


  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
//função que estabele quantos produtos serão listados na pagina


  const handleEdit = (staffParameter: DataStaff) => {
    //função que abre o Dialog de criação / edição de cadastros
    setStaff(staffParameter)
    setOpen(true)
  };

  const handleDelete = async (staffParameter: DataStaff) => {
    try{
        await http.delete(`service-user/staff/${staffParameter.idStaff}`)
        setReload(!reload)
        setSnackMessage("Registro excluído com sucesso.")
    }
    catch(error){
        console.log(error);
        setSnackMessage("Não foi possível excluir o Tamanho")
    }

  };

  const handleChangeSearch = (event: any) => {
    const { target: { name, value } } = event;
    setSearch(value )
    if(!value){
        makeSearch()
    }
  }
//função que atualiza a busca de acordo com o que foi digitado pelo usuário


  const makeSearch = () =>{
    if(page==0){
        setReload(!reload)
    }
    else{
        setPage(0) 
    }
    
  }

  //função que de fato faz a busca pelo clique ou o pressionar da tecla enter


  const handleKeyDownSearch = (event: any) => {
    if (event.key === 'Enter') {
        makeSearch()
    }
    //função responsável por ativar a ação de buscar, acionada ao pressionar o tecla Enter do teclado
  }

  
  React.useEffect (()=>{
    const loadData = async () =>{
        setLoading(true)
        try{
            console.log('load')
            const response = await http.post('service-user/staff/list', {
                name: search,
                items: rowsPerPage,
                page: page+1,
                order: {name:"ASC"}
            })
            if(response.data.data?.result){
                if(Array.isArray(response.data.data.result)){
                    setStaffs(response.data.data.result)
                    setTotal(response.data.data.total)
                }
                else{
                    setSnackMessage("Nenhum registro foi encontrado.")
                }
            }
            else{
                setSnackMessage("Nenhum registro foi encontrado.") 
            }

        }
        catch(error){
            console.log(error)
            setSnackMessage("Não foi possível processar a solicitação.")
        }
        setLoading(false)
    }
    loadData()
  },[page, reload])

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        { loading &&
            <Box sx={{ width: '100%' }}>
              <LinearProgress color="secondary" />
            </Box> 
        }
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Grid container padding={2} spacing={2}>
                    <Grid item xs={10}>                           
                        <TextField id="search" onKeyDown={handleKeyDownSearch} onChange={handleChangeSearch} placeholder='buscar' size="small" variant="outlined" />
                                                
                        <SearchIcon 
                            fontSize='medium' 
                            sx={{cursor:'pointer'}}
                            onClick={() => {
                                setReload(!reload)
                            }}
                        />

                        
                    </Grid>
                    { auth.rules?.find(rule => rule?.description == 'Adicionar Funcionários') || auth.groupAdmin ?
                    <Grid item xs={2}>
                        <Button type='submit' 
                            onClick={() =>handleEdit({
                                name: '' ,
                                login: '',
                                cpf:'',
                                id_number:'',
                                password:'',
                                active: false ,
                                locked: false,
                                sector: '',
                                role: '',
                                ctps: '',
                                phone: '',
                                mobile: ''
                              })} 
                            variant='contained' 
                            sx={{ mr: 1, mt:3 }}
                        >
                            Adicionar
                        </Button>
                    </Grid>
                    :null}
                </Grid>
            </Grid>
            <Grid item xs={12}>
                
                <TableContainer sx={{ maxHeight: 340 }}>
                    <Table stickyHeader size='small' aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            <TableCell
                                key={'staff'}
                                align={'left'}
                                style={{ minWidth: 200 }}
                            >
                                Nome
                            </TableCell>

                            <TableCell
                                key={'login'}
                                align={'left'}
                                style={{ minWidth: 200 }}
                            >
                                Login
                            </TableCell>
                            

                            <TableCell
                                key={'ativo'}
                                align={'center'}
                                style={{ maxWidth: 80 }}
                            >
                                Ativo
                            </TableCell>

                            <TableCell
                                key={'bloqueado'}
                                align={'center'}
                                style={{ maxWidth: 80 }}
                            >
                                Bloqueado
                            </TableCell>

                            <TableCell
                                key={'setor'}
                                align={'left'}
                                style={{ minWidth: 200 }}
                            >
                                Setor
                            </TableCell>
                            <TableCell
                                key={'role'}
                                align={'left'}
                                style={{ minWidth: 200 }}
                            >
                                Função
                            </TableCell>

                            
                            <TableCell
                                key={'celular'}
                                align={'right'}
                                style={{ minWidth: 100 }}
                            >
                                Celular
                            </TableCell>
                            
                            <TableCell
                                key={'acoes'}
                                align={'right'}
                                style={{ minWidth: 80 }}
                            >
                                Ações
                            </TableCell>                            
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            staffs.map((staff, index) => (
                                <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                                    
                                    <TableCell
                                        key={'staff'}
                                        align={'left'}
                                        style={{ minWidth: 200 }}
                                    >
                                        {staff.name}
                                    </TableCell>


                                    <TableCell
                                        key={'login'}
                                        align={'left'}
                                        style={{ minWidth: 200 }}
                                    >
                                        {staff.login}
                                    </TableCell>

                                                                    
                                    <TableCell
                                        key={'ativo'}
                                        align={'center'}
                                        style={{ maxWidth: 80 }}
                                    >
                                        <Checkbox disabled checked={staff.active} />
                                    
                                        
                                    </TableCell>

                                    <TableCell
                                        key={'bloqueado'}
                                        align={'center'}
                                        style={{ maxWidth: 80 }}
                                    >
                                        <Checkbox disabled checked={staff.locked} />
                                    
                                        
                                    </TableCell>

                                    <TableCell
                                        key={'setor'}
                                        align={'left'}
                                        style={{ minWidth: 200 }}
                                    >
                                        {staff.sector}
                                    </TableCell>

                                    <TableCell
                                        key={'função'}
                                        align={'left'}
                                        style={{ minWidth: 200 }}
                                    >
                                        {staff.role}
                                    </TableCell>


                                    <TableCell
                                        key={'celular'}
                                        align={'right'}
                                        style={{ minWidth: 100 }}
                                    >
                                        {staff.mobile}
                                    </TableCell>
                                    <TableCell
                                        key={'createdDate'}
                                        align={'right'}
                                        style={{ minWidth: 50 }}
                                    >
                                            <SearchIcon 
                                                fontSize='medium' 
                                                sx={{cursor:'pointer'}}
                                                onClick={() =>handleEdit({
                                                    idStaff:staff.idStaff,
                                                    name: staff.name,
                                                    login: staff.login,
                                                    cpf: staff.cpf,
                                                    id_number: staff.id_number,
                                                    password: staff.password,
                                                    active: staff.active,
                                                    locked: staff.locked,
                                                    sector: staff.sector,
                                                    role: staff.role,
                                                    ctps: staff.ctps,
                                                    phone: staff.phone,
                                                    mobile: staff.mobile
                                                  })}
                                            /> &nbsp;   
                                            { auth.rules?.find(rule => rule?.description == 'Excluir Funcionários') || auth.groupAdmin ?                                          
                                            <DeleteIcon 
                                                fontSize='medium' 
                                                sx={{cursor:'pointer'}}
                                                onClick={() =>handleDelete({
                                                    idStaff:staff.idStaff,
                                                    name: staff.name,
                                                    login: staff.login,
                                                    cpf: staff.cpf,
                                                    id_number: staff.id_number,
                                                    password: staff.password,
                                                    active: staff.active,
                                                    locked: staff.locked,
                                                    sector: staff.sector,
                                                    role: staff.role,
                                                    ctps: staff.ctps,
                                                    phone: staff.phone,
                                                    mobile: staff.mobile
                                                  })}
                                            /> 
                                            :null}
                                    </TableCell>
                                </TableRow>

                            ))
                        }
                    </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
                    component="div"
                    count={total}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Grid>
        </Grid>


        <ViewStaffComponent 
            open={open} 
            reload={reload}
            staff={staff}
            setSnackMessage = {setSnackMessage}
            setOpen = {setOpen}
            setReload = {setReload}
        />
       

        <Snackbar
            anchorOrigin={{  vertical: 'bottom', horizontal: 'left' }}
            open={snackMessage!=''}
            onClose={()=> setSnackMessage('')}
            message={snackMessage}
            key={'snack'}
            autoHideDuration={5000}
        />       
    </Paper>
  );
}