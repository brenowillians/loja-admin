import { Button, Checkbox, Dialog, DialogActions, DialogContent, FormControl, FormControlLabel, FormHelperText, Grid, InputLabel, MenuItem, Select, Switch, TextField } from "@mui/material";
import React, { Fragment } from "react";
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { DataProduct } from "..";
import http from "@/utils/http";

interface ViewProductProps {
    open: boolean;
    reload: boolean;
    product: DataProduct;
    setSnackMessage:React.Dispatch<React.SetStateAction<string>>;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;

}
interface DataSize {
    idSize: number;
    name: string ;
    active: boolean ;
    createdId: number;
    updatedId: number | null;
}

interface DataProductSize {
    idProductSize: number;
    idProduct: number;
    idSize: number;
    available: boolean ;
    createdId: number;
    updatedId: number | null;
    createdDate?: string;
    updatedDate?: string;
    deletedDate?: string;  
}

interface DataBrand {
    idBrand?: number;
    name: string ;
    active: boolean ;
    createdId: number;
    updatedId: number | null;
}

interface DataCategory {
    idCategory?: number;
    name: string ;
    active: boolean ;
    createdId: number;
    updatedId: number | null;
}


const schema = yup.object().shape({
    name: yup.string().required("O Nome do Banco não pode estar em branco."),
    active: yup.boolean(),
    image: yup.string(),//.required("A imagem do  não pode estar em branco."),
    fullPrice: yup.number().transform((val,orig) => orig == "" ? undefined : val).required("O Preço do Produto não pode estar em branco.").typeError("Value must be a number*"),
    salePrice: yup.number().typeError("O Preço do Produto não pode estar em branco."),//.required("O Preço de Venda do Banco pode estar em branco, pois pode ou não estar em promoção."),
    onSale: yup.boolean(),//.required("O Estoque do Banco não pode estar em branco."),
    description: yup.string().required("A Descrição do Produto não pode estar em branco."),
    idBrand: yup.number().required("A Marca do Produto não pode estar em branco."),
    idCategory: yup.number().required("A Categoria do Produto não pode estar em branco."),
})
//yup:controla as ações individuais no formulário de cada função (cada botão de switch, o que for ou não preenchido etc)


export default function ViewProductComponent(props: ViewProductProps) {
    const { open, reload, product, setSnackMessage, setOpen, setReload } = props

    const [categories, setCategories] =React.useState<DataCategory[]>([])
    const [brands, setBrands] =React.useState<DataBrand[]>([])
    const [sizes, setSizes] =React.useState<DataSize[]>([])
    const [originalProductSizes, setOriginalProductSizes] =React.useState<DataProductSize[]>([])
    const [productSizes, setProductSizes] =React.useState<DataProductSize[]>([])

    const defaultValues = {
        name: product.name,
        active: product.active,
        image: product.image ,
        fullPrice: product.fullPrice,
        salePrice: product.salePrice,
        onSale: product.onSale ,
        description: product.description ,
        idBrand: product.idBrand,
        idCategory: product.idCategory
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




    // Efeito que carrega as brands e as categories
    React.useEffect (()=>{
        const loadData = async () =>{
            try{
                const responseBrand = await http.post('service-product/brand/list', {
                    items: 999999999999,
                    page: 1,
                    order: {name:"ASC"}
                })
                if(responseBrand.data.data?.result){
                    if(Array.isArray(responseBrand.data.data.result)){
                        setBrands(responseBrand.data.data.result)
                    }
                }
                const responseCategory = await http.post('service-product/category/list', {
                    items: 999999999999,
                    page: 1,
                    order: {name:"ASC"}
                })
    
                if(responseCategory.data.data?.result){
                    if(Array.isArray(responseCategory.data.data.result)){
                        setCategories(responseCategory.data.data.result)
                    }
                }
    
            }
            catch(error){
                console.log(error)
                setSnackMessage("Não foi possível processar a solicitação.")
            }
        }
        loadData()
    },[])


    //Efeito que carrega o produto selecionado dentro hook-form quando o componente pai altera o state product
    React.useEffect(()=>{

        reset({
            name: product.name,
            active: product.active,                   
            image: product.image ,
            fullPrice: product.fullPrice,
            salePrice: product.salePrice,
            onSale: product.onSale ,
            description: product.description ,
            idBrand: product.idBrand,
            idCategory: product.idCategory
        })

        const loadSize = async () =>{
            try{
                if(product.idProduct){
                    const responseProductSize = await http.post('service-product/product-size/list', {
                        idProduct: product.idProduct,
                        items: 999999999999,
                        page: 1,
                        order: {idProduct:"ASC"}
                    })

                    console.log(responseProductSize.data.data?.result)
                    if(responseProductSize.data.data?.result){
                        if(Array.isArray(responseProductSize.data.data.result)){
                            setProductSizes(responseProductSize.data.data.result)
                            setOriginalProductSizes(responseProductSize.data.data.result)
                        }
                        else{
                            setProductSizes([])
                            setOriginalProductSizes([])
                        }
                    }
                    else{
                        setProductSizes([])
                        setOriginalProductSizes([])
                    }
                }
                else{
                    setProductSizes([])
                    setOriginalProductSizes([])
                }

                const responseSize = await http.post('service-product/size/list', {
                    items: 999999999999,
                    page: 1,
                    order: {name:"ASC"}
                })



                if(responseSize.data.data?.result){
                    if(Array.isArray(responseSize.data.data.result)){
                        setSizes(responseSize.data.data.result)
                    }
                }

            }
            catch(error){

            }
        }
        loadSize()
    },[product])
    

    const onSubmit =  async(data: any) =>{
        try{
    
            let modifiedProduct={...product,...data}
    
          //setProduct(modifiedProduct)
      
          if(modifiedProduct.idProduct){ //UPDATE
            await http.patch(`service-product/product/${modifiedProduct.idProduct}`,modifiedProduct)
    
            console.log(originalProductSizes)
            console.log(productSizes)
    
            //deletar todos os productsizes existentes
            if(originalProductSizes.length){
                for(const productSize of originalProductSizes){
                    await http.delete(`service-product/product-size/${productSize.idProductSize}`)
                }
            }
    
            //criar os novos productsizes marcados no formulario
            if(productSizes.length){
                for(const productSize of productSizes){
                    await http.post(`service-product/product-size/`, {
                        idProduct: modifiedProduct.idProduct,
                        idSize: productSize.idSize,
                        available: false,
                        createdId: 1
                    })
                }
            }
            setSnackMessage("Registro atualizado com sucesso.")
          }
          else{ //INSERT
            const result =await http.post(`service-product/product/`,modifiedProduct)
    
            //criar os novos productsizes marcados no formulario
            if(productSizes.length){
                for(const productSize of productSizes){
                    await http.post(`service-product/product-size/`, {
                        idProduct:result.data.idProduct,
                        idSize: productSize.idSize,
                        available: false,
                        createdId: 1
                    })
                }
            }
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
    //função que faz subir e registrar o produto, seja criando uma nova, seja editando uma já criada.


    const handleProductSize= (event: any) =>{
        let newProductSizes = [... productSizes]
        if(event.target.checked){
            
            newProductSizes.push({
                idProductSize:0,
                idProduct:0,
                idSize: +event.target.value,
                available: false ,
                createdId: 0,
                updatedId: 0
            })
            console.log(event.target.value)
        }
        else{
            newProductSizes = [... newProductSizes.filter(e => e.idSize != +event.target.value)]
        }
        console.log(newProductSizes)
        setProductSizes(newProductSizes) 
    }

    return (
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
                        <FormControl fullWidth>
                            <Controller
                                name='name'
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange, onBlur } }) => (
                                    <TextField
                                        autoFocus
                                        size='small'
                                        label='Nome do Produto'
                                        value={value}
                                        onBlur={onBlur}
                                        onChange={onChange}
                                        error={Boolean(errors.name)}
                                        placeholder='Nome do Produto'
                                        inputProps={{ maxLength: 100 }}
                                    />
                                )}
                            />
                            {errors.name && <FormHelperText sx={{ color: 'error.main' }}>{errors.name.message}</FormHelperText>}
                        </FormControl>

                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <Controller
                                name='fullPrice'
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange, onBlur } }) => (
                                    <TextField
                                        size='small'
                                        label='Valor Cheio'
                                        value={value}
                                        onBlur={onBlur}
                                        onChange={onChange}
                                        error={Boolean(errors.fullPrice)}
                                        placeholder='Valor Cheio'
                                        inputProps={{ maxLength: 15 }}
                                    />
                                )}
                            />
                            {errors.fullPrice && <FormHelperText sx={{ color: 'error.main' }}>{errors.fullPrice.message}</FormHelperText>}
                        </FormControl>

                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <Controller
                                name='salePrice'
                                control={control}
                                //rules={{ required: true }}
                                render={({ field: { value, onChange, onBlur } }) => (
                                    <TextField
                                        size='small'
                                        label='Valor Promocional'
                                        value={value}
                                        onBlur={onBlur}
                                        onChange={onChange}
                                        error={Boolean(errors.salePrice)}
                                        placeholder='Valor Promocional'
                                        inputProps={{ maxLength: 100 }}
                                    />
                                )}
                            />
                            {errors.salePrice && <FormHelperText sx={{ color: 'error.main' }}>{errors.salePrice.message}</FormHelperText>}
                        </FormControl>

                    </Grid>
                    <Grid item xs={6} sm={3}>

                        <FormControl fullWidth>
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
                    </Grid>

                    <Grid item xs={6} sm={3}>

                        <FormControl fullWidth>
                            <Controller
                                name='onSale'
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange} }) => (
                                        <FormControlLabel
                                            control={<Switch checked={value} onChange={onChange} />}
                                            label="Em Promoção"
                                        />
                                )}
                            />
                            {errors.onSale && <FormHelperText sx={{ color: 'error.main' }}>{errors.onSale.message}</FormHelperText>}
                        </FormControl>
                    </Grid>


                    <Grid item xs={12} sm={6}>
                        
                            <Controller
                                name='idBrand'
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange, onBlur } }) => (
                                    <FormControl fullWidth>
                                        <InputLabel id="select-brand-label">Marca</InputLabel>
                                        <Select
                                        labelId="select-brand-label"
                                        id="select-brand"
                                        value={value??0}
                                        label="Marca"
                                        onChange={onChange}
                                        >
                                            <MenuItem key={'brand0'} value={0}>Selecione</MenuItem>
                                            {brands && brands.map((brand,index) =>{
                                                return(
                                                    <MenuItem key={index} value={brand.idBrand}>{brand.name}</MenuItem>
                                                )
                                            })}
                                        </Select>
                                    </FormControl>
                                )}
                            />
                            {errors.idBrand && <FormHelperText sx={{ color: 'error.main' }}>{errors.idBrand.message}</FormHelperText>}


                    </Grid>   
                    <Grid item xs={12} sm={6}>
                        
                            <Controller
                                name='idCategory'
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange, onBlur } }) => (
                                    <FormControl fullWidth>
                                        <InputLabel id="select-category-label">Categoria</InputLabel>
                                        <Select
                                        labelId="select-category-label"
                                        id="select-category"
                                        value={value?? 0}
                                        label="Marca"
                                        onChange={onChange}
                                        >
                                            <MenuItem key={'Category0'} value={0}>Selecione</MenuItem>
                                            {categories && categories.map((category,index) =>{
                                                return(
                                                    <MenuItem key={index} value={category.idCategory}>{category.name}</MenuItem>
                                                )
                                            })}
                                        </Select>
                                    </FormControl>
                                )}
                            />
                            {errors.idCategory && <FormHelperText sx={{ color: 'error.main' }}>{errors.idCategory.message}</FormHelperText>}
                        

                    </Grid>                 
                    <Grid item xs={12} sm={12}>
                        <FormControl fullWidth>
                            <Controller
                                name='description'
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange, onBlur } }) => (
                                    <TextField
                                        autoFocus
                                        label='Descrição'
                                        value={value}
                                        onBlur={onBlur}
                                        onChange={onChange}
                                        error={Boolean(errors.name)}
                                        placeholder='Descrição do Produto'
                                        multiline
                                        maxRows={4}
                                        //inputProps={{ maxLength: 100 }}
                                    />
                                )}
                            />
                            {errors.name && <FormHelperText sx={{ color: 'error.main' }}>{errors.name.message}</FormHelperText>}
                        </FormControl>

                    </Grid>

                    <Grid item xs={12} sm={6}>
                        {
                            sizes.map((size, index) =>{
                                return(
                                    <Fragment>
                                        <Checkbox key={index} value={size.idSize} onChange={handleProductSize} checked={productSizes.find(e => e.idSize == size.idSize)? true : false} />
                                        {size.name}
                                        <br/>
                                    </Fragment>
                                   
                                )
                            })
                        }
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
    )
}