import React from 'react'
import Header from '../../components/app/Header'
import { useCallback, useEffect, useRef, useState } from "react"
import { useDispatch } from "react-redux"
import { setBreadCrumbItemsAction, setToastAction } from "../../store/actions/appActions"
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { useForm } from "../../hooks/useForm";
import { useFormErrorsHandle } from "../../hooks/useFormErrorsHandle";
import moment from "moment";
import fetchApi from "../../helpers/fetchApi";
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { FileUpload } from 'primereact/fileupload';
import wait from "../../helpers/wait";
import Loading from "../../components/app/Loading";
import { useNavigate } from "react-router-dom";
import { InputMask } from "primereact/inputmask";
import { Password } from 'primereact/password';
import { InputTextarea } from "primereact/inputtextarea";
import { utilisateurswb_routes_items } from "../../routes/rapport_stage/utilisateurswb_routes";
import statutContactColor from '../../helpers/statutContactColor'
const initialForm = {
  NOM: '',
  PRENOM: '',
  EMAIL: '',
  MESSAGE: '',
}

const Contactpage = () => {
  const dispacth = useDispatch()
  const [data, handleChange, setData, setValue] = useForm(initialForm)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()


  const { hasError, getError, setErrors, getErrors, checkFieldData, isValidate, setError } = useFormErrorsHandle(data, {
    NOM: {
      required: true,
      length: [1, 50],
      alpha: true
    },
    PRENOM: {
      required: true,
      length: [1, 50],
      alpha: true
    },

    EMAIL: {
      required: true,
      length: [1, 50],
      alpha: true,
      email: true,
    },
    MESSAGE: {
      required: true
    },
  }, {
    NOM: {
      required: "Ce champ est obligatoire",
      length: "Le nom ne doit etre depasser max(50 carateres)",
      alpha: "Le nom est invalide"
    },
    PRENOM: {
      required: "Ce champ est obligatoire",
      length: "Le prenom ne doit etre depasser max(50 carateres)",
      alpha: "Le prenom est invalide"
    },
    EMAIL: {
      required: "Ce champ est obligatoire",
      length: "L'email ne doit pas depasser max(50 caracteres)",
      alpha: "L'email est invalide",
      email: "L'email n'existe pas",
    },
    MESSAGE: {
      required: "Ce champ est obligatoire"
    },
  })



  const handleSubmit = async (e) => {
    try {
      e.preventDefault()
      if (isValidate()) {
        setIsSubmitting(true)
        const form = new FormData()
        form.append("NOM", data.NOM);
        form.append("PRENOM", data.PRENOM);
        form.append("EMAIL", data.EMAIL);
        form.append("MESSAGE", data.MESSAGE);

        const res = await fetchApi(`/rapport_stage/contact/create`, {
          method: 'POST',
          body: form
        })

        dispacth(
          setToastAction({
            severity: "success",
            summary: 'Utilisateur enregistré',
            detail: "L'utilisateur a été enregistré avec succès",
            life: 3000,
          })
        );
        navigate('/contact'),
          navigate(0);
      }
      else {
        console.log(getErrors())
        setErrors(getErrors());
        dispacth(
          setToastAction({
            severity: "error",
            summary: 'La validation des données a échouée',
            detail: 'Veuillez corriger les erreurs mentionnées pour continuer',
            life: 3000,
          })
        );
        await wait(500)
        const header = document.querySelector('header')
        const nav = document.querySelector('nav')
        const firstErrorElement = document.querySelector(".p-invalid")
        if (firstErrorElement) {
          var headerHeight = 0
          if (header) headerHeight += header.offsetHeight
          if (nav) headerHeight += nav.offsetHeight
          const scrollPosition = firstErrorElement.getBoundingClientRect().top + window.scrollY - headerHeight;
          window.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
          });
        }

      }
    }
    catch (error) {
      console.log(error)
      if (error.httpStatus == "UNPROCESSABLE_ENTITY") {
        setErrors(error.result);
        dispacth(setToastAction({
          severity: 'error',
          summary: 'Erreur du système',
          detail: 'Erreur du système, réessayez plus tard',
          life: 3000
        }));
        await wait(500)
        const header = document.querySelector('header')
        const nav = document.querySelector('nav')
        const firstErrorElement = document.querySelector(".p-invalid")
        if (firstErrorElement) {
          var headerHeight = 0
          if (header) headerHeight += header.offsetHeight
          if (nav) headerHeight += nav.offsetHeight
          const scrollPosition = firstErrorElement.getBoundingClientRect().top + window.scrollY - headerHeight;
          window.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
          });
        }
      } else {
        dispacth(setToastAction({
          severity: 'error',
          summary: 'Erreur du système',
          detail: 'Erreur du système, réessayez plus tard',
          life: 3000
        }));
      }

    } finally {
      setIsSubmitting(false)
    }
  }



  useEffect(() => {
    dispacth(setBreadCrumbItemsAction([
      utilisateurswb_routes_items.utilisateurswb,
      utilisateurswb_routes_items.contact
    ]))
    return () => {
      dispacth(setBreadCrumbItemsAction([]))
    }
  }, [])

  const invalidClass = name => hasError(name) ? 'is-invalid' : ''

  return (


    <>
      <div className="pt-md-0 pb-md-0">
        <main id="content" role="main" className="flex-grow-1">
          <div className="d-flex flex-column flex-md-row align-items-md-center p-0" style={{ backgroundColor: '#2C3E50' }}>
            <div className="px-5 py-3 main_content has_footer">
              <div className="d-flex flex-column flex-md-row align-items-md-center p-5 bg-light mb-4">
                <div className="pt-md-3 pb-md-4">
                  <h1 className="bd-title mt-0">CONTACTEZ-NOUS.</h1>
                  <p className="bd-lead">
                    Bienvenue sur notre site dédié à la consultation en ligne des rapports de stages académiques déjà déposés. Les étudiants peuvent accéder à ces documents pour s'inspirer et rester motivés dans leur apprentissage.
                  </p>
                </div>
              </div>

              <div className="row">
                <div className="col-md-8">
                  {/* Contenu supplémentaire ici */}
                  <div className="d-flex flex-column flex-md-row align-items-md-center p-5 bg-light mb-4 border-round-top border-round-bottom">
                    <div className="pt-md-3 pb-md-4">
                      <h4 className="bd-title mt-0">SMS.</h4>
                      <p className="bd-lead">
                        Bienvenue sur notre site dédié à la consultation en ligne des rapports de stages académiques déjà déposés
                      </p>

                    </div>
                  </div>

                  <div className="d-flex flex-column flex-md-row align-items-md-center p-5 bg-light mb-4 border-round-top border-round-bottom">
                    <div className="pt-md-3 pb-md-4">
                      <h4 className="bd-title mt-0">SMS.</h4>
                      <p className="bd-lead">
                        Bienvenue sur notre site dédié à la consultation en ligne des rapports de stages académiques déjà déposés. Les étudiants peuvent accéder à ces documents pour s'inspirer et rester motivés dans leur apprentissage.
                      </p>
                    </div>
                  </div>
                  <div className="d-flex flex-column flex-md-row align-items-md-center p-5 bg-light mb-4 border-round-top border-round-bottom">
                    <div className="pt-md-3 pb-md-4">
                      <h4 className="bd-title mt-0">SMS.</h4>
                      <p className="bd-lead">
                        Bienvenue sur notre site dédié à la consultation en ligne des rapports de stages académiques déjà déposés. Les étudiants peuvent accéder à ces documents pour s'inspirer et rester motivés dans leur apprentissage.
                      </p>
                    </div>
                  </div>


                </div>
                <div className="col-md-4 mb-4">
                  <div className="card p-5 shadow-2 border-round bg-light">
                    <h1 className="text-center mb-2">Formulaire</h1>

                    <form onSubmit={handleSubmit}>
                      <div className="field mt-3">
                        <label htmlFor="NOM" className="font-semibold">Nom</label>
                        <InputText
                          id="NOM"
                          name="NOM"
                          value={data.NOM}
                          onChange={handleChange}
                          onBlur={checkFieldData}
                          className={`w-full ${hasError('NOM') ? 'p-invalid' : ''}`}
                          placeholder="Saisissez un nom"
                        />
                        <small className="p-error">{hasError('NOM') ? getError('NOM') : ""}</small>
                      </div>

                      <div className="field">
                        <label htmlFor="PRENOM" className="font-semibold">Prénom</label>
                        <InputText
                          id="PRENOM"
                          name="PRENOM"
                          value={data.PRENOM}
                          onChange={handleChange}
                          onBlur={checkFieldData}
                          className={`w-full ${hasError('PRENOM') ? 'p-invalid' : ''}`}
                          placeholder="Écrire votre prénom"
                        />
                        <small className="p-error">{hasError('PRENOM') ? getError('PRENOM') : ""}</small>
                      </div>

                      <div className="field">
                        <label htmlFor="EMAIL" className="font-semibold">Email</label>
                        <InputText
                          id="EMAIL"
                          name="EMAIL"
                          value={data.EMAIL}
                          onChange={handleChange}
                          onBlur={checkFieldData}
                          className={`w-full ${hasError('EMAIL') ? 'p-invalid' : ''}`}
                          placeholder="Écrire votre email"
                        />
                        <small className="p-error">{hasError('EMAIL') ? getError('EMAIL') : ""}</small>
                      </div>

                      <div className="field">
                        <label htmlFor="MESSAGE" className="font-semibold">Message</label>
                        <InputTextarea
                          id="MESSAGE"
                          name="MESSAGE"
                          value={data.MESSAGE}
                          onChange={handleChange}
                          onBlur={checkFieldData}
                          className={`w-full ${hasError('MESSAGE') ? 'p-invalid' : ''}`}
                          placeholder="Écrire votre message"
                          rows={5}
                        />
                        <small className="p-error">{hasError('MESSAGE') ? getError('MESSAGE') : ""}</small>
                      </div>

                      <Button label="Envoyer" type="submit" className="w-full mt-3 ml-3" size="small" disabled={isSubmitting} />
                    </form>
                  </div>
                </div>
              </div>

              <footer style={{ color: '#e9ecef', marginTop: '30px' }} className="p-d-flex p-flex-wrap p-ai-center p-py-3 p-my-4 p-border-top">
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
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default Contactpage