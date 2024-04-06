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
import { Button, Dialog, DialogActions, DialogContent, FormControl, FormControlLabel, FormHelperText, Switch, Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import http from '../../utils/http'
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import Checkbox from '@mui/material/Checkbox';
import Snackbar from '@mui/material/Snackbar';

interface DataStaff {
    idStaff?: number;
    name: string ;
    login: string;
    active: boolean ;
    locked: boolean;
    sector: string;
    role: string;
    ctps: string;
    phone: string;
    mobile: string;
}

const schema = yup.object().shape({
    name: yup.string().required("O Nome não pode estar em branco."),
    login: yup.string().required("O Login não pode estar em branco."),
    active: yup.boolean(),
    locked: yup.boolean(),
    sector: yup.string().required("O Setor  não pode estar em branco."),
    role: yup.string().required("A Função  não pode estar em branco."),
    ctps: yup.string(),//.required("A imagem do  não pode estar em branco."),
    phone: yup.string(),//.required("A imagem do  não pode estar em branco."),
    mobile: yup.string().required("O Celular não pode estar em branco."),
})
//yup:controla as ações individuais no formulário de cada função (cada botão de switch, o que for ou não preenchido etc)

export default function StickyHeadTable() {
  //const defaultValues: Data[] = []

  const [open, setOpen] = React.useState(false);
  const [snackMessage, setSnackMessage] = React.useState('');
  const [reload, setReload] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [search, setSearch] = React.useState('');
  const [staffs, setStaffs] =React.useState<DataStaff[]>([])
  const [staff, setStaff] =React.useState<DataStaff>({
    idStaff: 0,
    name: '' ,
    login: '',
    active: false ,
    locked: false,
    sector: '',
    role: '',
    ctps: '',
    phone: '',
    mobile: ''
  })
  const [total, setTotal] = React.useState(0);
 

  const defaultValues = {
    name: staff.name,
    login: staff.login,
    active: staff.active,
    locked: staff.locked,
    sector: staff.sector,
    role: staff.role,
    ctps: staff.ctps,
    phone: staff.phone,
    mobile: staff.mobile
    
    }

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        defaultValues,
        mode:'onSubmit',
        resolver: yupResolver(schema)
    })




    React.useEffect(()=>{
        reset({
            name: staff.name,
            login: staff.login,
            active: staff.active,
            locked: staff.locked,
            sector: staff.sector,
            role: staff.role,
            ctps: staff.ctps,
            phone: staff.phone,
            mobile: staff.mobile
        })
    },[staff])

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

  const onSubmit =  async(data: any) =>{
    try{

        let modifiedStaff={...staff,...data}

      setStaff(modifiedStaff)
  
      if(modifiedStaff.idStaff){ //UPDATE
        await http.patch(`service-user/staff/${modifiedStaff.idStaff}`,modifiedStaff)
        setSnackMessage("Registro atualizado com sucesso.")
      }
      else{ //INSERT
        await http.post(`service-user/staff/`,modifiedStaff)
        setSnackMessage("Registro criado com sucesso.")
      }
      setOpen(false)
      setReload(!reload)
    }
    catch(error){
      console.log(error)
      setSnackMessage("Não foi possível processar a solicitação.")
    }
  }
  //função que faz subir e registrar o tamanho, seja criando uma nova, seja editando uma já criada.

  React.useEffect (()=>{
    const loadData = async () =>{
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
    }
    loadData()
  },[page, reload])

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
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
                    <Grid item xs={2}>
                        <Button type='submit' 
                            onClick={() =>handleEdit({
                                name: '' ,
                                login: '',
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
                                        key={'ctps'}
                                        align={'right'}
                                        style={{ minWidth: 100 }}
                                    >
                                        {staff.ctps}
                                    </TableCell>

                                    <TableCell
                                        key={'telefone'}
                                        align={'right'}
                                        style={{ minWidth: 100 }}
                                    >
                                        {staff.phone}
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
                                        style={{ minWidth: 100 }}
                                    >
                                            <EditIcon 
                                                fontSize='medium' 
                                                sx={{cursor:'pointer'}}
                                                onClick={() =>handleEdit({
                                                    idStaff:staff.idStaff,
                                                    name: staff.name,
                                                    login: staff.login,
                                                    active: staff.active,
                                                    locked: staff.locked,
                                                    sector: staff.sector,
                                                    role: staff.role,
                                                    ctps: staff.ctps,
                                                    phone: staff.phone,
                                                    mobile: staff.mobile
                                                  })}
                                            /> &nbsp;                                             
                                            <DeleteIcon 
                                                fontSize='medium' 
                                                sx={{cursor:'pointer'}}
                                                onClick={() =>handleDelete({
                                                    idStaff:staff.idStaff,
                                                    name: staff.name,
                                                    login: staff.login,
                                                   active: staff.active,
                                                    locked: staff.locked,
                                                    sector: staff.sector,
                                                    role: staff.role,
                                                    ctps: staff.ctps,
                                                    phone: staff.phone,
                                                    mobile: staff.mobile
                                                  })}
                                            /> 
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

        <Dialog
            open={open}
            onClose={() =>setOpen(false)}
            aria-labelledby='user-view-edit'
            sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 650, p: [2, 10] } }}
            aria-describedby='user-view-edit-description'
        >
            <form  autoComplete='off' onSubmit={handleSubmit(onSubmit)}>              
            <DialogContent>
                <Grid container spacing={6}>
                
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth sx={{ mb: 4 }}>
                            <Controller
                                name='name'
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange, onBlur } }) => (
                                    <TextField
                                        autoFocus
                                        label='Nome'
                                        value={value}
                                        onBlur={onBlur}
                                        onChange={onChange}
                                        error={Boolean(errors.name)}
                                        placeholder='Nome'
                                        inputProps={{ maxLength: 100 }}
                                    />
                                )}
                            />
                            {errors.name && <FormHelperText sx={{ color: 'error.main' }}>{errors.name.message}</FormHelperText>}
                        </FormControl>

                        <FormControl fullWidth sx={{ mb: 4 }}>
                            <Controller
                                name='login'
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange, onBlur } }) => (
                                    <TextField
                                        autoFocus
                                        label='Login'
                                        value={value}
                                        onBlur={onBlur}
                                        onChange={onChange}
                                        error={Boolean(errors.login)}
                                        placeholder='Login'
                                        inputProps={{ maxLength: 100 }}
                                    />
                                )}
                            />
                            {errors.login && <FormHelperText sx={{ color: 'error.main' }}>{errors.login.message}</FormHelperText>}
                        </FormControl>
                        
                        <FormControl fullWidth sx={{ mb: 4 }}>
                            <Controller
                                name='sector'
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange, onBlur } }) => (
                                    <TextField
                                        autoFocus
                                        label='Setor'
                                        value={value}
                                        onBlur={onBlur}
                                        onChange={onChange}
                                        error={Boolean(errors.sector)}
                                        placeholder='Setor'
                                        inputProps={{ maxLength: 100 }}
                                    />
                                )}
                            />
                            {errors.sector && <FormHelperText sx={{ color: 'error.main' }}>{errors.sector.message}</FormHelperText>}
                        </FormControl>
                        <FormControl fullWidth sx={{ mb: 4 }}>
                            <Controller
                                name='role'
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange, onBlur } }) => (
                                    <TextField
                                        autoFocus
                                        label='Função'
                                        value={value}
                                        onBlur={onBlur}
                                        onChange={onChange}
                                        error={Boolean(errors.role)}
                                        placeholder='Função'
                                        inputProps={{ maxLength: 100 }}
                                    />
                                )}
                            />
                            {errors.role && <FormHelperText sx={{ color: 'error.main' }}>{errors.role.message}</FormHelperText>}
                        </FormControl>
                        
                        <FormControl fullWidth sx={{ mb: 4 }}>
                            <Controller
                                name='ctps'
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange, onBlur } }) => (
                                    <TextField
                                        autoFocus
                                        label='Ctps'
                                        value={value}
                                        onBlur={onBlur}
                                        onChange={onChange}
                                        error={Boolean(errors.ctps)}
                                        placeholder='Ctps'
                                        inputProps={{ maxLength: 100 }}
                                    />
                                )}
                            />
                            {errors.ctps && <FormHelperText sx={{ color: 'error.main' }}>{errors.ctps.message}</FormHelperText>}
                        </FormControl>
                                        
                    
                        <FormControl fullWidth sx={{ mb: 4 }}>
                            <Controller
                                name='phone'
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange, onBlur } }) => (
                                    <TextField
                                        autoFocus
                                        label='Telefone'
                                        value={value}
                                        onBlur={onBlur}
                                        onChange={onChange}
                                        error={Boolean(errors.phone)}
                                        placeholder='Telefone'
                                        inputProps={{ maxLength: 100 }}
                                    />
                                )}
                            />
                            {errors.phone && <FormHelperText sx={{ color: 'error.main' }}>{errors.phone.message}</FormHelperText>}
                        </FormControl>

                        <FormControl fullWidth sx={{ mb: 4 }}>
                            <Controller
                                name='mobile'
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange, onBlur } }) => (
                                    <TextField
                                        autoFocus
                                        label='Celular'
                                        value={value}
                                        onBlur={onBlur}
                                        onChange={onChange}
                                        error={Boolean(errors.mobile)}
                                        placeholder='Celular'
                                        inputProps={{ maxLength: 100 }}
                                    />
                                )}
                            />
                            {errors.mobile && <FormHelperText sx={{ color: 'error.main' }}>{errors.mobile.message}</FormHelperText>}
                        </FormControl>

                    </Grid>
                    <Grid item xs={12} sm={6}>

                        <FormControl fullWidth sx={{ mb: 4 }}>
                            <Controller
                                name='active'
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange} }) => (
                                        <FormControlLabel
                                            control={<Switch checked={value} onChange={onChange} />}
                                            label="Ativo"
                                        />
                                )}
                            />
                            {errors.active && <FormHelperText sx={{ color: 'error.main' }}>{errors.active.message}</FormHelperText>}
                        </FormControl>
                        <FormControl fullWidth sx={{ mb: 4 }}>
                            <Controller
                                name='locked'
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange} }) => (
                                        <FormControlLabel
                                            control={<Switch checked={value} onChange={onChange} />}
                                            label="Bloqueado"
                                        />
                                )}
                            />
                            {errors.locked && <FormHelperText sx={{ color: 'error.main' }}>{errors.locked.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>

                    </Grid>
                </Grid>
            
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center' }}>
                <Button type='submit' variant='contained' sx={{ mr: 1, mt:3 }}>
                    Salvar
                </Button>
                <Button variant='outlined' sx={{ mr: 1, mt:3 }} color='secondary' onClick={() =>setOpen(false)}>
                    Fechar
                </Button>
            </DialogActions>
            </form>
        </Dialog> 

        <Snackbar
            anchorOrigin={{  vertical: 'bottom', horizontal: 'left' }}
            open={snackMessage!=''}
            onClose={()=> setSnackMessage('')}
            message={snackMessage}
            key={'snack'}
        />       
    </Paper>
  );
}