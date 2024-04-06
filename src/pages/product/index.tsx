import * as React from 'react';
import Paper from '@mui/material/Paper';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Grid from '@mui/material/Grid';
import { Box, Button, Dialog, DialogActions, DialogContent, FormControl, FormControlLabel, FormHelperText, InputLabel, MenuItem, Select, Switch, Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import http from '../../utils/http'

import Checkbox from '@mui/material/Checkbox';
import Snackbar from '@mui/material/Snackbar';
import ViewProductComponent from './components/view';


export interface DataProduct {
    idProduct?: number;
    name: string ;
    active: boolean ;
    createdId: number;
    updatedId: number | null;
    image: string ;
    fullPrice: number;
    salePrice?: number;
    onSale: boolean ;
    description: string ;
    idBrand: number; 
    idCategory: number; 
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
  const [products, setProducts] =React.useState<DataProduct[]>([])
  const [product, setProduct] =React.useState<DataProduct>({
    idProduct:0,
    name: '',
    active: false,
    createdId: 0,
    updatedId: null,
    image: '' ,
    fullPrice: 0,
    onSale: false ,
    description: '' ,
    idBrand: 0,
    idCategory: 0
  })
  const [total, setTotal] = React.useState(0);
 



    React.useEffect (()=>{
        const loadData = async () =>{
            try{
                setLoading(true)
                const response = await http.post('service-product/product/list', {
                    name: search,
                    items: rowsPerPage,
                    page: page+1,
                    order: {name:"ASC"}
                })
                if(response.data.data?.result){
                    if(Array.isArray(response.data.data.result)){
                        setProducts(response.data.data.result)
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
    

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
//função que muda a página das listagens de produtos


  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
//função que estabele quantos produtos serão listados na pagina


  const handleEdit = (productParameter: DataProduct) => {
    //função que abre o Dialog de criação / edição de cadastros
    console.log(productParameter)
    setProduct(productParameter)
    setOpen(true)
  };

  const handleDelete = async (productParameter: DataProduct) => {
    try{
        await http.delete(`service-product/product/${productParameter.idProduct}`)
        setReload(!reload)
        setSnackMessage("Registro excluído com sucesso.")
    }
    catch(error){
        console.log(error);
        setSnackMessage("Não foi possível excluir o Produto")
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
                                active: false,
                                createdId: 0,
                                updatedId: null,
                                image: 'vazio.jpg' ,
                                fullPrice: 0,
                                onSale: false ,
                                description: '',
                                idBrand: 0,
                                idCategory: 0
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
                                Nome do Produto
                            </TableCell>

                            <TableCell
                                key={'fullPrice'}
                                align={'left'}
                                style={{ minWidth: 60 }}
                            >
                                Valor Cheio
                            </TableCell>

                            <TableCell
                                key={'onSale'}
                                align={'center'}
                                style={{ maxWidth: 80 }}
                            >
                                Em Promoção
                            </TableCell>

                            <TableCell
                                key={'salePrice'}
                                align={'left'}
                                style={{ minWidth: 60 }}
                            >
                                Valor Promocional
                            </TableCell>

                            <TableCell
                                key={'ativo'}
                                align={'center'}
                                style={{ maxWidth: 80 }}
                            >
                                Ativo
                            </TableCell>

                            <TableCell
                                key={'acoes'}
                                align={'right'}
                                style={{ minWidth: 100 }}
                            >
                                Ações
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            products.map((product, index) => (
                                <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                                    
                                    <TableCell
                                        key={'descricao'}
                                        align={'left'}
                                        style={{ minWidth: 200 }}
                                    >
                                        {product.name}
                                    </TableCell>

                                    <TableCell
                                        key={'fullPrice'}
                                        align={'left'}
                                        style={{ minWidth: 60 }}
                                    >
                                        {product.fullPrice}
                                    
                                    </TableCell>

                                    <TableCell
                                        key={'onSale'}
                                        align={'center'}
                                        style={{ maxWidth: 80 }}
                                    >
                                        <Checkbox disabled checked={product.onSale} />
                                    
                                    </TableCell>

                                    <TableCell
                                        key={'salePrice'}
                                        align={'left'}
                                        style={{ minWidth: 60 }}
                                    >
                                        {product.salePrice}
                                        
                                    </TableCell>


                                    <TableCell
                                        key={'ativo'}
                                        align={'center'}
                                        style={{ maxWidth: 80 }}
                                    >
                                        <Checkbox disabled checked={product.active} />
                                    
                                        
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
                                                    idProduct: product.idProduct,
                                                    name: product.name,
                                                    active: product.active,
                                                    createdId: 0,
                                                    updatedId: null,
                                                    image: product.image ,
                                                    fullPrice: product.fullPrice,
                                                    salePrice: product.salePrice,
                                                    onSale: product.onSale ,
                                                    description: product.description,
                                                    idBrand: product.idBrand,
                                                    idCategory: product.idCategory
                                                  })}
                                            /> &nbsp;                                             
                                            <DeleteIcon 
                                                fontSize='medium' 
                                                sx={{cursor:'pointer'}}
                                                onClick={() =>handleDelete({
                                                    idProduct: product.idProduct,
                                                    name: product.name,
                                                    active: product.active,
                                                    createdId: 0,
                                                    updatedId: null,
                                                    image: product.image ,
                                                    fullPrice: product.fullPrice,
                                                    salePrice: product.salePrice,
                                                    onSale: product.onSale ,
                                                    description: product.description,
                                                    idBrand: product.idBrand,
                                                    idCategory: product.idCategory
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

        <ViewProductComponent 
            open={open} 
            reload={reload}
            product={product}
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