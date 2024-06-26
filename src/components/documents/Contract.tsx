import React, { useCallback, useEffect, useState } from "react";
import styles from "./Contract.module.css";
import { useDropzone } from "react-dropzone";
import {
  TbCircleCheckFilled,
  TbFaceId,
  TbFileCertificate,
  TbPhotoSearch,
  TbTrash,
} from "react-icons/tb";
import axios from "axios";
import { useGlobalContext } from "@/context/Auth";
import { toast } from "sonner";
import {
  ScalarDocument,
  ScalarLoanApplication,
  ScalarUser,
} from "@/types/User";
import CurrencyInput from "react-currency-input-field";
import SelectBanks from "../accesories/SelectBanks";
import Image from "next/image";

import { CiMoneyCheck1 } from "react-icons/ci";
import { useRouter } from "next/navigation";
import Modal from "../modal/Modal";
import PreEnvio from "./PreEnvio";
import { useWebSocket } from "next-ws/client";
import AccountType from "../accesories/TypeAccount";
import Link from "next/link";

function Contract({
  userId,
  toggleContract,
}: {
  userId: string;
  toggleContract: () => void;
}) {
  const { user } = useGlobalContext();
  const ws = useWebSocket();

  const [dataContract, setDataContract] =
    useState<ScalarLoanApplication | null>(null);

  const [userInfo, setUserInfo] = useState<ScalarUser | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    key: keyof ScalarLoanApplication
  ) => {
    const { value } = e.target;

    setDataContract((prevFormData) => ({
      ...(prevFormData as ScalarLoanApplication),
      [key]: value,
    }));
  };

  const handleOpenPreSend = () => {
    try {
      if (dataContract) {
        if (
          dataContract.bankCurrentAccount == false &&
          dataContract.bankSavingAccount == false
        )
          throw new Error("Eligue tu tipo de cuenta");
        if (!dataContract.cantity)
          throw new Error("Ingresa la cantidad a solicitar");
        if (!dataContract.entity)
          throw new Error("Selecciona tu entidad bancaria");
        if (
          !dataContract.fisrt_flyer &&
          !dataContract.second_flyer &&
          !dataContract.third_flyer
        )
          throw new Error("Volantes de pago incompletos");
        if (!dataContract.labor_card)
          throw new Error("Sube tu carta laboral actualizada");
        if (!dataContract.terms_and_conditions)
          throw new Error("Acepta los terminos y condiciones");

        setOpenPreSend(true);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.warning(error.message);
      }
    }
  };

  console.log(userId);

  const [laborCard, setLaborCard] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [imagePreview1, setImagePreview1] = useState("No definido");
  const [imagePreview2, setImagePreview2] = useState("No definido");
  const [imagePreview3, setImagePreview3] = useState("No definido");
  const [imagePreview4, setImagePreview4] = useState("No definido");
  const [imagePreview5, setImagePreview5] = useState("No definido");
  const [imagePreview6, setImagePreview6] = useState("No definido");

  const [cantity, setCantity] = useState<string | null>(null);
  console.log(cantity);

  const router = useRouter();

  const [contentOpenDoc, setContentOpenDoc] = useState<
    string | undefined | null
  >(user?.avatar);

  const [link, setLink] = useState<string>();

  const [loadingProccessImg01, setLoadingProccessImg01] =
    useState<boolean>(false);
  const [loadingProccessImg02, setLoadingProccessImg02] =
    useState<boolean>(false);
  const [loadingProccessImg03, setLoadingProccessImg03] =
    useState<boolean>(false);
  const [loadingProccessImg04, setLoadingProccessImg04] =
    useState<boolean>(false);
  const [loadingProccessImg05, setLoadingProccessImg05] =
    useState<boolean>(false);
  const [loadingProccessImg06, setLoadingProccessImg06] =
    useState<boolean>(false);

  const [openViewPdf, setOpenViewPdf] = useState<boolean>(false);

  const [openPreSend, setOpenPreSend] = useState<boolean>(false);

  const handlerOpenModel = ({ link }: { link: string }) => {
    setOpenViewPdf(true);
    setLink(link);
  };

  const handleCloseModel = () => {
    setOpenViewPdf(false);
  };

  const handleClosePre = () => {
    setOpenPreSend(false);
  };

  const [openDocs, setOpenDocs] = useState<boolean>(false);

  const handleOpenViewDocImg = () => {
    setOpenDocs(!openDocs);
  };

  const handleAcceptTerms = () => {
    setDataContract((prevDataContract) => ({
      ...(prevDataContract as ScalarLoanApplication),
      terms_and_conditions: true,
    }));
  };

  useEffect(() => {
    setLoading(true)
    const getInfoUserDocs = async () => {
      try {
        if (user && user.token) {
          const response = await axios.post(
            "/api/user/list_docs",
            {
              userId: userId,
            },
            { headers: { Authorization: `Bearer ${user.token}` } }
          );
          console.log(response.data);
          if (response.data && response.data.data && response.data.data[0]) {
            const data: ScalarDocument = response.data.data[0];
            setImagePreview1(data.documentFront as string);
            setImagePreview2(data.documentBack as string);
            setLoading(false);
          }
        }
      } catch (error) {
        console.log(error);

        if (error instanceof Error) {
          console.log(error.cause);
        }
      }
    };

    getInfoUserDocs();
  }, [userId, user?.token]);

  useEffect(() => {
    setLoading(true)
    const getInfoUser = async () => {
      try {
        if (user && user.token) {
          const response = await axios.post(
            "/api/user/id",
            {
              userId: user && user.id,
            },
            { headers: { Authorization: `Bearer ${user.token}` } }
          );
          // console.log(response);
          const data: ScalarUser = response.data.data;
          // console.log(data);
          setUserInfo(data);
          setDataContract((prevDataContract) => ({
            ...(prevDataContract as ScalarLoanApplication),
            userId: data.id as string,
          }));
          setLoading(false);
        }
      } catch (error) {
        console.log(error);
      }
    };

    getInfoUser();
  }, [userId, user?.token]);

  const handleDeleteDoc = async (type: string) => {
    const response = await axios.post(
      "/api/user/delete_doc",
      {
        userId,
        type,
      },
      {
        headers: { Authorization: `Bearer ${user?.token}` },
      }
    );

    // console.log(response);

    if (response.data.success) {
      setImagePreview1(response.data.data[0].documentFront);
      setImagePreview2(response.data.data[0].documentBack);
      toast.success("Documento eliminado");
    } else if (response.data.success == false) {
      toast.error("Imposible eliminar documento");
    }
  };

  const handleSetViewDocImg = ({ image }: { image: string }) => {
    setContentOpenDoc(image);
  };

  const handleAuthLoan = async () => {
    try {
      setOpenPreSend(false);
      console.log(dataContract);

      const response = await axios.post(
        "/api/loan/create",
        {
          loanData: dataContract,
        },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );

      console.log(response);

      if (response.data.success == true) {
        ws?.send(
          JSON.stringify({
            type: "new_loan",
            owner: user?.id,
          })
        );

        toggleContract();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al enviar la solicitud");
    }
  };

  const handleSaveSignature = (signatureUrl: string) => {
    setDataContract((prevFormData) => ({
      ...(prevFormData as ScalarLoanApplication),
      signature: signatureUrl,
    }));
  };

  const handleOptionBank = (option: string) => {
    setDataContract((prevDataContract) => ({
      ...(prevDataContract as ScalarLoanApplication),
      entity: option,
    }));
  };

  const handleTypeBank = (type: string) => {
    if (type == "current") {
      setDataContract((prevDataContract) => ({
        ...(prevDataContract as ScalarLoanApplication),
        bankCurrentAccount: true,
        bankSavingAccount: false,
      }));
    } else if (type == "saving") {
      setDataContract((prevDataContract) => ({
        ...(prevDataContract as ScalarLoanApplication),
        bankSavingAccount: true,
        bankCurrentAccount: false,
      }));
    }
  };

  const onDrop1 = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setLoadingProccessImg01(true);
      const file = acceptedFiles[0];
    }
  }, []);

  const onDrop2 = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setLoadingProccessImg02(true);
      const file = acceptedFiles[0];
    }
  }, []);

  const onDrop3 = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setLoadingProccessImg03(true);
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", "labor_card");
      if (user) formData.append("userid", user.id);

      // const success = await UploadFile(formData);

      const response = await axios.post("/api/upload/google/create", formData, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success == false) {
        setLoadingProccessImg03(false);
        toast.error("Error al subir archivo, intente mas tarde");
        console.log(response.data.error);
      }

      if ((response.data.success = true)) {
        setLoadingProccessImg03(false);
        const uri = response.data.data as string;
        setImagePreview3(uri);
        setDataContract((prevDataContract) => ({
          ...(prevDataContract as ScalarLoanApplication),
          labor_card: uri,
        }));
        toast.success("Archivo cargado exitosamente");
      }

      console.log(response.data.success);
    }
  }, []);

  const onDrop4 = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setLoadingProccessImg04(true);
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", "paid_flyer_01");
      if (user) formData.append("userid", user.id);

      const response = await axios.post("/api/upload/google/create", formData, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success == false) {
        setLoadingProccessImg04(false);
        toast.error("Error al subir archivo, intente mas tarde");
        console.log(response.data.error);
      }

      if ((response.data.success = true)) {
        setLoadingProccessImg04(false);
        const uri = response.data.data as string;
        setImagePreview4(uri);
        setDataContract((prevDataContract) => ({
          ...(prevDataContract as ScalarLoanApplication),
          fisrt_flyer: uri,
        }));
        toast.success("Archivo cargado exitosamente");
      }

      console.log(response.data.success);
    }
  }, []);

  const onDrop5 = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setLoadingProccessImg05(true);
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", "paid_flyer_02");
      if (user) formData.append("userid", user.id);

      const response = await axios.post("/api/upload/google/create", formData, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success == false) {
        setLoadingProccessImg05(false);
        toast.error("Error al subir archivo, intente mas tarde");
        console.log(response.data.error);
      }

      if ((response.data.success = true)) {
        setLoadingProccessImg05(false);
        const uri = response.data.data as string;
        setImagePreview5(uri);
        setDataContract((prevDataContract) => ({
          ...(prevDataContract as ScalarLoanApplication),
          second_flyer: uri,
        }));
        toast.success("Archivo cargado exitosamente");
      }

      console.log(response.data.success);
    }
  }, []);

  const onDrop6 = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setLoadingProccessImg06(true);
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append("file", file);

      formData.append("name", "paid_flyer_03");
      if (user) formData.append("userid", user.id);

      const response = await axios.post("/api/upload/google/create", formData, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success == false) {
        setLoadingProccessImg06(false);
        toast.error("Error al subir archivo, intente mas tarde");
        console.log(response.data.error);
      }

      if ((response.data.success = true)) {
        setLoadingProccessImg06(false);
        const uri = response.data.data as string;
        setImagePreview6(uri);
        setDataContract((prevDataContract) => ({
          ...(prevDataContract as ScalarLoanApplication),
          third_flyer: uri,
        }));
        toast.success("Archivo cargado exitosamente");
      }

      console.log(response.data.success);
    }
  }, []);

  const { getRootProps: getRootProps1, getInputProps: getInputProps1 } =
    useDropzone({ onDrop: onDrop1 });

  const { getRootProps: getRootProps2, getInputProps: getInputProps2 } =
    useDropzone({ onDrop: onDrop2 });

  const { getRootProps: getRootProps3, getInputProps: getInputProps3 } =
    useDropzone({ onDrop: onDrop3 });

  const { getRootProps: getRootProps4, getInputProps: getInputProps4 } =
    useDropzone({ onDrop: onDrop4 });

  const { getRootProps: getRootProps5, getInputProps: getInputProps5 } =
    useDropzone({ onDrop: onDrop5 });

  const { getRootProps: getRootProps6, getInputProps: getInputProps6 } =
    useDropzone({ onDrop: onDrop6 });

  if (loading) {
    <p>Loading...</p>
  }

  return (
    <>
      <div className={styles.btnClose}>
        <p onClick={toggleContract}>Cancelar</p>
      </div>

      <div className={styles.ContractContainer}>
        <div className={styles.partBox}>
          <div className={styles.partSelect}>
            <SelectBanks select={handleOptionBank} />
          </div>

          <div className={styles.accountInput}>
            <h5>Numero de cuenta</h5>
            <input
              type="text"
              onChange={(e) => handleInputChange(e, "bankNumberAccount")}
            />
          </div>

          <AccountType onSelectAccountType={handleTypeBank} />

          <div className={styles.partPrice}>
            <h5>Cuanto necesitas?</h5>
            <CurrencyInput
              className={styles.inputPrice}
              placeholder="Ingresa la cantidad"
              defaultValue={0}
              decimalsLimit={2}
              onValueChange={(value, name, values) => {
                setCantity(value as string);
                setDataContract((prevDataContract) => ({
                  ...(prevDataContract as ScalarLoanApplication),
                  cantity: value as string,
                }));
                console.log(value, name, values);
              }}
              prefix="$"
            />
          </div>

          <div>
            <h3 className={styles.titleVolants}>
              Tres ultimos bolantes de pago
            </h3>
            <div className={styles.columnCards}>
              <div
                className={styles.boxInfoPay}
                {...(imagePreview4 === "No definido" ? getRootProps4() : {})}
              >
                {imagePreview4 === "No definido" && (
                  <input {...getInputProps4()} />
                )}
                {imagePreview4 && imagePreview4 != "No definido" ? (
                  <>
                    <div className={styles.supraBarStatus}>
                      <div className={styles.barStatusDocs}>
                        <div className={styles.headerCardStatus}>
                          <div className={styles.boxIconStatus}>
                            <TbCircleCheckFilled className={styles.iconCheck} />
                          </div>
                          <p className={styles.warninCC}>
                            Primer volante de pago subido
                          </p>
                        </div>
                      </div>

                      <div className={styles.boxDoc}>
                        <button
                          className={styles.btnOpenDoc}
                          onClick={() =>
                            handlerOpenModel({
                              link: imagePreview4,
                            })
                          }
                        >
                          Ver documento
                        </button>
                      </div>

                      <div className={styles.boxIconsStatus}>
                        <div
                          className={styles.boxIcon}
                          onClick={() => {
                            handleOpenViewDocImg();
                            handleSetViewDocImg({ image: imagePreview4 });
                          }}
                        >
                          <TbPhotoSearch
                            className={styles.viewIcon}
                            size={20}
                          />
                        </div>
                        <div
                          className={styles.boxIcon}
                          onClick={() => handleDeleteDoc("front")}
                        >
                          <TbTrash className={styles.trashIcon} size={20} />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className={styles.containerDropDocuments}>
                    <div className={styles.boxIconPreview}>
                      <CiMoneyCheck1 className={styles.iconPreview} size={60} />
                    </div>
                    <p className={styles.textPreview}>
                      {loadingProccessImg04 && "Processando tu bolante..."}
                      {!loadingProccessImg04 && "Subir primer bolante de pago"}
                    </p>
                  </div>
                )}
              </div>

              <div
                className={styles.boxInfoPay}
                {...(imagePreview5 === "No definido" ? getRootProps5() : {})}
              >
                {imagePreview5 === "No definido" && (
                  <input {...getInputProps5()} />
                )}
                {imagePreview5 && imagePreview5 != "No definido" ? (
                  <>
                    <div className={styles.supraBarStatus}>
                      <div className={styles.barStatusDocs}>
                        <div className={styles.headerCardStatus}>
                          <div className={styles.boxIconStatus}>
                            <TbCircleCheckFilled className={styles.iconCheck} />
                          </div>
                          <p className={styles.warninCC}>
                            Segundo bolante de pago subido
                          </p>
                        </div>
                      </div>

                      <div className={styles.boxDoc}>
                        <button
                          className={styles.btnOpenDoc}
                          onClick={() =>
                            handlerOpenModel({
                              link: imagePreview5,
                            })
                          }
                        >
                          Ver documento
                        </button>
                      </div>

                      <div className={styles.boxIconsStatus}>
                        <div
                          className={styles.boxIcon}
                          onClick={() => {
                            handleOpenViewDocImg();
                            handleSetViewDocImg({ image: imagePreview5 });
                          }}
                        >
                          <TbPhotoSearch
                            className={styles.viewIcon}
                            size={20}
                          />
                        </div>
                        <div
                          className={styles.boxIcon}
                          onClick={() => handleDeleteDoc("front")}
                        >
                          <TbTrash className={styles.trashIcon} size={20} />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className={styles.containerDropDocuments}>
                    <div className={styles.boxIconPreview}>
                      <CiMoneyCheck1 className={styles.iconPreview} size={60} />
                    </div>
                    <p className={styles.textPreview}>
                      {loadingProccessImg05 && "Processando tu documento..."}
                      {!loadingProccessImg05 && "Subir segundo bolante de pago"}
                    </p>
                  </div>
                )}
              </div>

              <div
                className={styles.boxInfoPay}
                {...(imagePreview6 === "No definido" ? getRootProps6() : {})}
              >
                {imagePreview6 === "No definido" && (
                  <input {...getInputProps6()} />
                )}
                {imagePreview6 && imagePreview6 != "No definido" ? (
                  <>
                    <div className={styles.supraBarStatus}>
                      <div className={styles.barStatusDocs}>
                        <div className={styles.headerCardStatus}>
                          <div className={styles.boxIconStatus}>
                            <TbCircleCheckFilled className={styles.iconCheck} />
                          </div>
                          <p className={styles.warninCC}>
                            Tercer bolante de pago subido
                          </p>
                        </div>
                      </div>

                      <div className={styles.boxDoc}>
                        <button
                          className={styles.btnOpenDoc}
                          onClick={() =>
                            handlerOpenModel({
                              link: imagePreview4,
                            })
                          }
                        >
                          Ver documento
                        </button>
                      </div>

                      <div className={styles.boxIconsStatus}>
                        <div
                          className={styles.boxIcon}
                          onClick={() => {
                            handleOpenViewDocImg();
                            handleSetViewDocImg({ image: imagePreview6 });
                          }}
                        >
                          <TbPhotoSearch
                            className={styles.viewIcon}
                            size={20}
                          />
                        </div>
                        <div
                          className={styles.boxIcon}
                          onClick={() => handleDeleteDoc("front")}
                        >
                          <TbTrash className={styles.trashIcon} size={20} />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className={styles.containerDropDocuments}>
                    <div className={styles.boxIconPreview}>
                      <CiMoneyCheck1 className={styles.iconPreview} size={60} />
                    </div>
                    <p className={styles.textPreview}>
                      {loadingProccessImg06 && "Processando tu bolante..."}
                      {!loadingProccessImg06 && "Subir tercer bolante de pago"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.partBox}>
          <div
            className={styles.boxInfoUser}
            {...(imagePreview1 === "No definido" ? getRootProps1() : {})}
          >
            {imagePreview1 === "No definido" && <input {...getInputProps1()} />}
            {imagePreview1 && imagePreview1 != "No definido" ? (
              <>
                <div className={styles.supraBarStatus}>
                  <div className={styles.barStatusDocs}>
                    <div className={styles.headerCardStatus}>
                      <div className={styles.boxIconStatus}>
                        <TbCircleCheckFilled className={styles.iconCheck} />
                      </div>
                      <p className={styles.warninCC}>
                        Documento frontal subido
                      </p>
                    </div>
                  </div>

                  <div className={styles.boxDoc}>
                    <Image
                      src={imagePreview1}
                      alt="dc"
                      className={styles.prevDoc}
                      width={200}
                      height={100}
                    />
                  </div>

                  <div className={styles.boxIconsStatus}>
                    <div
                      className={styles.boxIcon}
                      onClick={() => {
                        handleOpenViewDocImg();
                        handleSetViewDocImg({ image: imagePreview1 });
                      }}
                    >
                      <TbPhotoSearch className={styles.viewIcon} size={20} />
                    </div>
                    <div
                      className={styles.boxIcon}
                      onClick={() => handleDeleteDoc("front")}
                    >
                      <TbTrash className={styles.trashIcon} size={20} />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.containerDropDocuments}>
                <div className={styles.boxIconPreview}>
                  <TbFaceId className={styles.iconPreview} size={60} />
                </div>
                <p className={styles.textPreview}>
                  {loadingProccessImg01 && "Processando tu documento..."}
                  {!loadingProccessImg01 &&
                    "Toma una foto clara de la parte frontal de tu cedula"}
                </p>
              </div>
            )}
          </div>

          <div
            className={styles.boxInfoUser}
            {...(imagePreview2 === "No definido" ? getRootProps2() : {})}
          >
            {imagePreview2 === "No definido" && <input {...getInputProps2()} />}
            {imagePreview2 && imagePreview2 != "No definido" ? (
              <>
                <div className={styles.supraBarStatus}>
                  <div className={styles.barStatusDocs}>
                    <div className={styles.headerCardStatus}>
                      <div className={styles.boxIconStatus}>
                        <TbCircleCheckFilled className={styles.iconCheck} />
                      </div>
                      <p className={styles.warninCC}>
                        Documento trasero subido
                      </p>
                    </div>
                  </div>

                  <div className={styles.boxDoc}>
                    <Image
                      src={imagePreview2}
                      alt="dc"
                      className={styles.prevDoc}
                      width={200}
                      height={100}
                    />
                  </div>

                  <div className={styles.boxIconsStatus}>
                    <div
                      className={styles.boxIcon}
                      onClick={() => {
                        handleOpenViewDocImg();
                        handleSetViewDocImg({ image: imagePreview2 });
                      }}
                    >
                      <TbPhotoSearch className={styles.viewIcon} size={20} />
                    </div>
                    <div
                      className={styles.boxIcon}
                      onClick={() => handleDeleteDoc("front")}
                    >
                      <TbTrash className={styles.trashIcon} size={20} />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.containerDropDocuments}>
                <div className={styles.boxIconPreview}>
                  <TbFaceId className={styles.iconPreview} size={60} />
                </div>
                <p className={styles.textPreview}>
                  {loadingProccessImg02 && "Processando tu documento..."}
                  {!loadingProccessImg02 &&
                    "Toma una foto clara de la parte frontal de tu cedula"}
                </p>
              </div>
            )}
          </div>

          <div
            className={styles.boxInfoUser}
            {...(imagePreview3 === "No definido" ? getRootProps3() : {})}
          >
            {imagePreview3 === "No definido" && <input {...getInputProps3()} />}
            {imagePreview3 && imagePreview3 != "No definido" ? (
              <>
                <div className={styles.supraBarStatus}>
                  <div className={styles.barStatusDocs}>
                    <div className={styles.headerCardStatus}>
                      <div className={styles.boxIconStatus}>
                        <TbCircleCheckFilled className={styles.iconCheck} />
                      </div>
                      <p className={styles.warninCC}>Carta laboral subido</p>
                    </div>
                  </div>

                  <div className={styles.boxDoc}>
                    <button
                      className={styles.btnOpenDoc}
                      onClick={() =>
                        handlerOpenModel({
                          link: imagePreview3,
                        })
                      }
                    >
                      Ver documento
                    </button>
                  </div>

                  <div className={styles.boxIconsStatus}>
                    <div
                      className={styles.boxIcon}
                      onClick={() => {
                        handleOpenViewDocImg();
                        handleSetViewDocImg({ image: imagePreview3 });
                      }}
                    >
                      <TbPhotoSearch className={styles.viewIcon} size={20} />
                    </div>
                    <div
                      className={styles.boxIcon}
                      onClick={() => handleDeleteDoc("front")}
                    >
                      <TbTrash className={styles.trashIcon} size={20} />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.containerDropDocuments}>
                <div className={styles.boxIconPreview}>
                  <TbFileCertificate className={styles.iconPreview} size={60} />
                </div>
                <p className={styles.textPreview}>
                  {loadingProccessImg03 && "Processando tu documento..."}
                  {!loadingProccessImg03 && "Carga tu carta laboral aqui"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.boxTerms}>
        <div className={styles.centerBoxTerms}>
          <input type="checkbox" onChange={handleAcceptTerms} />
          <h5>
            Estoy de acuerdo con los{" "}
            <Link href={""}>Terminos y Condiciones</Link>
          </h5>
        </div>
      </div>

      <div>
        <button onClick={handleOpenPreSend}>Solicitar</button>
      </div>

      <Modal
        isOpen={openViewPdf}
        onClose={handleCloseModel}
        link={link as string}
        children={null}
      ></Modal>

      <Modal isOpen={openPreSend} onClose={handleAuthLoan} link={null}>
        <PreEnvio
          data={dataContract as ScalarLoanApplication}
          Success={handleAuthLoan}
          token={user?.token as string}
          signature={handleSaveSignature}
          completeName={`${userInfo?.names} ${userInfo?.firstLastName} ${userInfo?.secondLastName}`}
          mail={userInfo?.email as string}
        />
      </Modal>
    </>
  );
}

export default Contract;
