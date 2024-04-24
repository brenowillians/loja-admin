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
import { Box, Button, LinearProgress } from '@mui/material';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import http from '../../utils/http'
import {DataGroupRule} from './components/view'

import Checkbox from '@mui/material/Checkbox';
import Snackbar from '@mui/material/Snackbar';
import ViewGroupComponent from './components/view';

export interface DataGroup {
    idGroup?: number;
    name: string ;
    isAdmin: boolean ;
    groupRules?: DataGroupRule[];
}


export default function StickyHeadTable() {
  //const defaultValues: Data[] = []

  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [snackMessage, setSnackMessage] = React.useState('');
  const [reload, setReload] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [search, setSearch] = React.useState('');
  const [groups, setGroups] =React.useState<DataGroup[]>([])
  const [group, setGroup] =React.useState<DataGroup>({
    idGroup:0,
    name: '',
    isAdmin: false,
  })
  const [total, setTotal] = React.useState(0);
 

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
//função que muda a página das listagens de produtos


  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
//função que estabele quantos produtos serão listados na pagina


  const handleEdit = (groupParameter: DataGroup) => {
    //função que abre o Dialog de criação / edição de cadastros
    setGroup(groupParameter)
    setOpen(true)
  };

  const handleDelete = async (groupParameter: DataGroup) => {
    try{
        await http.delete(`service-user/group/${groupParameter.idGroup}`)
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
            const response = await http.post('service-user/group/list', {
                name: search,
                items: rowsPerPage,
                page: page+1,
                order: {name:"ASC"}
            })
            if(response.data.data?.result){
                if(Array.isArray(response.data.data.result)){
                    setGroups(response.data.data.result)
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
                    <Grid item xs={2}>
                        <Button type='submit' 
                            onClick={() =>handleEdit({
                                name: '',
                                isAdmin: false 
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
                                key={'descricao'}
                                align={'left'}
                                style={{ minWidth: 200 }}
                            >
                                Nome
                            </TableCell>

                            <TableCell
                                key={'ativo'}
                                align={'center'}
                                style={{ maxWidth: 80 }}
                            >
                                Cargo Administrativo
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            groups.map((group, index) => (
                                <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                                    
                                    <TableCell
                                        key={'nome'}
                                        align={'left'}
                                        style={{ minWidth: 200 }}
                                    >
                                        {group.name}
                                    </TableCell>
                                    <TableCell
                                        key={'isAdmin'}
                                        align={'center'}
                                        style={{ maxWidth: 80 }}
                                    >
                                        <Checkbox disabled checked={group.isAdmin} />
                                    
                                        
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
                                                    idGroup: group.idGroup,
                                                    name: group.name,
                                                    isAdmin: group.isAdmin
                                                    
                                                  })}
                                            /> &nbsp;                                             
                                            <DeleteIcon 
                                                fontSize='medium' 
                                                sx={{cursor:'pointer'}}
                                                onClick={() =>handleDelete({
                                                    idGroup: group.idGroup,
                                                    name: group.name,
                                                    isAdmin: group.isAdmin
                                                    
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

        <ViewGroupComponent 
            open={open} 
            reload={reload}
            group={group}
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