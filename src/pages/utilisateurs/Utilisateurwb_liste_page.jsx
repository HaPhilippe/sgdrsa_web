import { Link, Outlet, useNavigate, useNavigation } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setBreadCrumbItemsAction,
  setToastAction,
} from "../../store/actions/appActions";
import { administration_routes_items } from "../../routes/admin/administration_routes";
import { welcome_routes_items } from "../../routes/welcome/welcome_routes";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from 'primereact/dialog';
import moment from "moment";
import fetchApi from "../../helpers/fetchApi";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { SlideMenu } from "primereact/slidemenu";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import Loading from "../../components/app/Loading";
import { Image } from "primereact/image";
import { InputSwitch } from 'primereact/inputswitch';
import "../../styles/app1/style.css"
import { utilisateurswb_routes_items } from "../../routes/rapport_stage/utilisateurswb_routes";
import { userSelector } from "../../store/selectors/userSelector";

const UtilisateurSwitch = ({ utilisateur, change_status }) => {
  const [checked, setChecked] = useState(false)
  useEffect(() => {
    if (utilisateur?.IS_ACTIF) {
      setChecked(true)
    } else {
      setChecked(false)
    }
  }, [utilisateur])
  return (
    <InputSwitch checked={checked} onChange={(e) => {
      e.preventDefault()
      e.stopPropagation()
      setChecked(e.value)
      change_status(null, utilisateur?.ID_UTILISATEUR)
    }} />
  )
}

const UtilisateurSwitchNotEdit = ({ utilisateur, change_status }) => {
  const [checked, setChecked] = useState(false)
  useEffect(() => {
    if (utilisateur?.IS_ACTIF) {
      setChecked(true)
    } else {
      setChecked(false)
    }
  }, [utilisateur])
  return (
    <InputSwitch checked={checked} />
  )
}


export default function Utilisateur_liste_page() {

  const user = useSelector(userSelector)
  // const dispacth = useDispatch()

  const [selectedCity, setSelectedCity] = useState(null);
  const [date, setDate] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(1);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [details_modalUsers, setDetails_modalUsers] = useState(false);
  const [detail_users, setDetail_users] = useState(null);


  const paginatorLeft = <Button type="button" icon="pi pi-refresh" text />;
  const paginatorRight = <Button type="button" icon="pi pi-download" text />;
  const [selectedItems, setSelectedItems] = useState(null);
  const menu = useRef(null);
  const [inViewMenuItem, setInViewMenuItem] = useState(null);
  const [globalLoading, setGloabalLoading] = useState(false);

  const [visibleStatut, setVisibleStatut] = useState(false);

  const navigate = useNavigate();

  const [lazyState, setlazyState] = useState({
    first: 0,
    rows: 10,
    page: 1,
    sortField: null,
    sortOrder: null,
    search: "",
    filters: {
      name: { value: "", matchMode: "contains" },
      "country.name": { value: "", matchMode: "contains" },
      company: { value: "", matchMode: "contains" },
      "representative.name": { value: "", matchMode: "contains" },
    },
  });

  const dispacth = useDispatch();
  const handleVisibility = (e) => {
    setIsVisible(!isVisible);
  };
  const onPage = (event) => {
    setlazyState(event);
  };

  const onSort = (event) => {
    setlazyState(event);
  };

  const onFilter = (event) => {
    event["first"] = 0;
    setlazyState(event);
  };

  const onSelectionChange = (event) => {
    const value = event.value;
    setSelectedItems(value);
    setSelectAll(value.length === totalRecords);
  };

  const onSelectAllChange = (event) => {
    const selectAll = event.checked;

    if (selectAll) {
      setSelectAll(true);
      setSelectedItems(utilisateurs);
    } else {
      setSelectAll(false);
      setSelectedItems([]);
    }
  };

  const deleteItems = async (itemsIds) => {
    try {
      setGloabalLoading(true);
      const form = new FormData();
      form.append("ids", JSON.stringify(itemsIds));
      const res = await fetchApi("/administration/utilisateurs/detele_utilisateurs", {
        method: "POST",
        body: form,
      });
      dispacth(
        setToastAction({
          severity: "success",
          summary: "Utilisateur supprimé",
          detail: "L'utilisateur a été supprimé avec succès",
          life: 3000,
        })
      );
      fetchUtilisateurs();
      setSelectAll(false);
      setSelectedItems(null);
    } catch (error) {
      console.log(error);
      dispacth(
        setToastAction({
          severity: "error",
          summary: "Erreur du système",
          detail: "Erreur du système, réessayez plus tard",
          life: 3000,
        })
      );
    } finally {
      setGloabalLoading(false);
    }
  };

  const handleDeletePress = (e, itemsIds) => {
    e.preventDefault();
    e.stopPropagation();
    confirmDialog({
      headerStyle: { backgroundColor: '#ecc5c5', backgroundSize: 'cover' },
      headerClassName: "text-black",
      header: "Supprimer ?",
      message: (
        <div className="d-flex flex-column align-items-center">

          {inViewMenuItem ? (
            <>
              <img
                alt="flag"
                src={inViewMenuItem.IMAGE}
                className={`rounded object-fit-cover`}
                style={{ width: "100px", height: "100px" }}
              />
              <div className="font-bold text-center my-2">
                {inViewMenuItem?.NOM} {inViewMenuItem?.PRENOM}
              </div>
              <div className="text-center">
                Voulez-vous vraiment supprimer ?
              </div>
            </>
          ) : (
            <>
              <div className="text-muted">
                {selectedItems ? selectedItems.length : "0"} selectionné
                {selectedItems?.length > 1 && "s"}
              </div>
              <div className="text-center">
                Voulez-vous vraiment supprimer les éléments selectionnés ?
              </div>
            </>
          )}
        </div>
      ),
      acceptClassName: "p-button-danger",
      acceptLabel: "Oui",
      rejectLabel: "Non",
      accept: () => {
        deleteItems(itemsIds);
      },
    });
  };

  //fonction pour rendre active et desactive


  const change_status = async (e, ID_UTILISATEUR) => {
    try {
      setGloabalLoading(true);
      await fetchApi(
        `/administration/utilisateurs/change_statuts/${ID_UTILISATEUR}`,
        {
          method: "PUT",
        }
      );
      fetchUtilisateurs();
    } catch (error) {
      console.log(error);
    } finally {
      setGloabalLoading(false);
      // menu.current.hide(e);
    }
  };

  const fetchUtilisateurs = useCallback(async () => {
    try {
      setLoading(true);
      const baseurl = `/administration/utilisateurs/fetch?`;
      var url = baseurl;
      for (let key in lazyState) {
        const value = lazyState[key];
        if (value) {
          if (typeof value == "object") {
            url += `${key}=${JSON.stringify(value)}&`;
          } else {
            url += `${key}=${value}&`;
          }
        }
      }
      const res = await fetchApi(url);

      setUtilisateurs(res.result.data);
      setTotalRecords(res.result.totalRecords);

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [lazyState]);



  useEffect(() => {
    dispacth(setBreadCrumbItemsAction([utilisateurswb_routes_items.utilisateurswb]));
    return () => {
      dispacth(setBreadCrumbItemsAction([]));
    };
  }, []);



  useEffect(() => {
    fetchUtilisateurs();
  }, [lazyState]);
  return (
    <>
      <ConfirmDialog closable dismissableMask={true} />
      {globalLoading && <Loading />}

      {
        user.ID_PROFIL == 1 ?
          <>
            <div className="px-4 py-3 main_content">
              <div className="d-flex align-items-center justify-content-between">
                <h4 className="mb-3">Utilisateurs web</h4>
                <Button
                  label="Nouveau"
                  icon="pi pi-plus"
                  size="small"
                  onClick={() => {
                    navigate("/utilisateurs/new");
                  }}
                />
              </div>
              <div className="shadow my-2 bg-white p-3 rounded d-flex align-items-center justify-content-between">
                <div className="d-flex  align-items-center">
                  <div className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                      type="search"
                      placeholder="Recherche"
                      className="p-inputtext-sm"
                      style={{ minWidth: 300 }}
                      onInput={(e) =>
                        setlazyState((s) => ({ ...s, search: e.target.value }))
                      }
                    />
                  </div>

                </div>
                <div className="selection-actions d-flex align-items-center">
                  <div className="text-muted mx-3">
                    {selectedItems ? selectedItems.length : "0"} selectionné
                    {selectedItems?.length > 1 && "s"}
                  </div>
                  <a
                    href="#"
                    className={`p-menuitem-link link-dark text-decoration-none ${(!selectedItems || selectedItems?.length == 0) &&
                      "opacity-50 pointer-events-none"
                      }`}
                    style={{}}
                    onClick={(e) =>
                      handleDeletePress(
                        e,
                        selectedItems.map((item) => item.ID_UTILISATEUR)
                      )
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-trash"
                      viewBox="0 0 16 16"
                      style={{ marginRight: "0.3rem" }}
                    >
                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
                      <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
                    </svg>
                    <span className="p-menuitem-text">Supprimer</span>
                  </a>
                </div>
              </div>
              <div className="content">
                <div className="shadow rounded mt-3 pr-1 bg-white">
                  <DataTable
                    lazy
                    value={utilisateurs}
                    tableStyle={{ minWidth: "50rem" }}
                    className=""
                    paginator
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate={`Affichage de {first} à {last} dans ${totalRecords} éléments`}
                    emptyMessage="Aucun utilisateurs trouvé"
                    // paginatorLeft={paginatorLeft}
                    // paginatorRight={paginatorRight}
                    first={lazyState.first}
                    rows={lazyState.rows}
                    totalRecords={totalRecords}
                    onPage={onPage}
                    onSort={onSort}
                    sortField={lazyState.sortField}
                    sortOrder={lazyState.sortOrder}
                    onFilter={onFilter}
                    filters={lazyState.filters}
                    loading={loading}
                    selection={selectedItems}
                    onSelectionChange={onSelectionChange}
                    selectAll={selectAll}
                    onSelectAllChange={onSelectAllChange}
                    reorderableColumns
                    resizableColumns
                    columnResizeMode="expand"
                    paginatorClassName="rounded"
                    scrollable
                  // size="normal"
                  >
                    <Column
                      selectionMode="multiple"
                      frozen
                      headerStyle={{ width: "3rem" }}
                    />

                    <Column
                      field="IMAGE"
                      header="Utilisateurs"
                      frozen
                      sortable
                      body={(item) => {
                        const css = `
                            .round-indicator .p-image-preview-indicator {
                            border-radius: 50%
                            }`;
                        return (
                          <>
                            <div className="d-flex round-indicator">
                              <Image
                                src={item.IMAGE}
                                alt="Image"
                                className="rounded-5"
                                imageClassName="rounded-5 object-fit-cover"
                                imageStyle={{ width: "50px", height: "50px" }}
                                style={{ width: "50px", height: "50px" }}
                                preview
                              />
                              <div className="ml-2">
                                <div className="font-bold">
                                  {item.NOM} {item.PRENOM}
                                </div>
                                <div className="text-muted">{item.TELEPHONE}</div>
                              </div>
                            </div>
                            <style>{css}</style>
                          </>
                        );
                      }}
                    />

                    <Column
                      field="EMAIL"
                      header="Email"
                      sortable
                      body={(item) => item.EMAIL}
                    />
                    <Column
                      field="DESCRIPTION"
                      header="Profil"
                      sortable
                      body={(item) => item.PROFIL.DESCRIPTION}
                    />
                    <Column
                      field="IS_ACTIF"
                      header="Etat"
                      frozen
                      sortable
                      body={(item) => {
                        return (
                          <>
                            <UtilisateurSwitch utilisateur={item} change_status={change_status} />
                            {/* <UtilisateurSwitchNotEdit utilisateur={item} /> */}
                          </>
                        );
                      }}
                    />
                    <Column
                      field="DATE_INSERTION"
                      header="Date d'insertion"
                      sortable
                      body={(item) => {
                        return moment(item.DATE_INSERTION).format("DD/MM/YYYY HH:ss");
                      }}
                    />
                    <Column
                      field=""
                      header=""
                      alignFrozen="right"
                      frozen
                      body={(item) => {
                        const items = [

                          {
                            template: (deleteItem, options) => {
                              return (
                                <Link
                                  to={`/utilisateurs/edit/${inViewMenuItem?.ID_UTILISATEUR}`}
                                  className="p-menuitem-link"

                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    className="bi bi-pencil-square"
                                    viewBox="0 0 16 16"
                                    style={{ marginRight: "0.5rem" }}
                                  >
                                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                    <path
                                      fillRule="evenodd"
                                      d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
                                    />
                                  </svg>
                                  <span className="p-menuitem-text">Modifier</span>
                                </Link>
                              );
                            },
                          },
                          {
                            template: (deleteItem, options) => {
                              return (
                                <a
                                  href="#"
                                  className="p-menuitem-link text-danger"
                                  onClick={(e) =>
                                    handleDeletePress(e, [
                                      inViewMenuItem.ID_UTILISATEUR,
                                    ])
                                  }
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    className="bi bi-trash"
                                    viewBox="0 0 16 16"
                                    style={{ marginRight: "0.5rem" }}
                                  >
                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
                                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
                                  </svg>
                                  <span className="p-menuitem-text text-danger">
                                    Supprimer
                                  </span>
                                </a>
                              );
                            },
                          },

                          {
                            template: (deleteItem, options) => {
                              return inViewMenuItem?.IS_ACTIF ? (
                                <a
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    change_status(e, inViewMenuItem.ID_UTILISATEUR);
                                  }}
                                  className="p-menuitem-link"
                                >
                                  <span className="p-menuitem-text ">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-toggle-off" viewBox="0 0 16 16"
                                      style={{ marginRight: "0.5rem", transform: "scale(1.3)" }}>
                                      <path d="M11 4a4 4 0 0 1 0 8H8a4.992 4.992 0 0 0 2-4 4.992 4.992 0 0 0-2-4h3zm-6 8a4 4 0 1 1 0-8 4 4 0 0 1 0 8zM0 8a5 5 0 0 0 5 5h6a5 5 0 0 0 0-10H5a5 5 0 0 0-5 5z" />
                                    </svg>
                                    Desactive
                                  </span>
                                </a>
                              ) : (
                                <a
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    change_status(e, inViewMenuItem.ID_UTILISATEUR);
                                  }}
                                  className="p-menuitem-link"
                                >
                                  <span className="p-menuitem-text ">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-toggle-on" viewBox="0 0 16 16" style={{ marginRight: "0.5rem", transform: "scale(1.3)" }}>
                                      <path d="M5 3a5 5 0 0 0 0 10h6a5 5 0 0 0 0-10H5zm6 9a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
                                    </svg>
                                    Active
                                  </span>
                                </a>
                              );
                            },
                          },
                        ];
                        return (
                          <>
                            <SlideMenu
                              ref={menu}
                              model={items}
                              popup
                              viewportHeight={150}
                              menuWidth={220}
                              onHide={() => {
                                setInViewMenuItem(null);
                              }}
                            />
                            <Button
                              rounded
                              severity="secondary"
                              text
                              aria-label="Menu"
                              size="small"
                              className="mx-1"
                              onClick={(event) => {

                                setInViewMenuItem(item);
                                setDetail_users(item)
                                menu.current.toggle(event);
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-three-dots"
                                viewBox="0 0 16 16"
                              >
                                <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                              </svg>
                            </Button>

                          </>
                        );
                      }}
                    />


                  </DataTable>
                </div>
              </div>
            </div>
          </>
          :
          <>
            <p style={{ color: 'white',marginBottom:'50vh' }}>Vous avez pas les droits pour moment!</p>

            <footer style={{ backgroundColor: '#2C3E50', color: '#e9ecef' }} className="p-d-flex p-flex-wrap p-ai-center p-py-3 p-my-4 p-border-top ">
              <div className="p-col-12 p-md-4 p-d-flex p-ai-center">
                <a href="/" className="p-mb-3 p-mr-2 p-mb-md-0 p-text-body-secondary p-text-decoration-none">
                  <svg className="bi" width="30" height="24">
                    <use xlinkHref="#bootstrap"></use>
                  </svg>
                </a>
                <span className="p-mb-3 p-mb-md-0 p-text-body-secondary">© 2024 Philip, Norbert et Cardin à Ult</span>
              </div>

              <ul className="p-col-12 p-md-4 p-justify-end p-list-unstyled p-d-flex">
                <li className="p-mx-3">
                  <a className="p-text-body-secondary" href="#">
                    <svg className="bi" width="24" height="24">
                      <use xlinkHref="#twitter"></use>
                    </svg>
                  </a>
                </li>
                <li className="p-mx-3">
                  <a className="p-text-body-secondary" href="#">
                    <svg className="bi" width="24" height="24">
                      <use xlinkHref="#instagram"></use>
                    </svg>
                  </a>
                </li>
                <li className="p-mx-3">
                  <a className="p-text-body-secondary" href="#">
                    <svg className="bi" width="24" height="24">
                      <use xlinkHref="#facebook"></use>
                    </svg>
                  </a>
                </li>
              </ul>
            </footer>
          </>
      }

      <Outlet />
    </>
  );
}
