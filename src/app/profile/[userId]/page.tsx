"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import styles from "./page.module.css";
import CopyText from "@/components/accesories/CopyText";
import Avatar from "react-avatar";
import Image from "next/image";
import axios from "axios";
import { ScalarDocument } from "@/types/User";
import { toast } from "sonner";
import { useGlobalContext } from "@/context/Auth";
import imageCompression from "browser-image-compression";

function Profile({ params }: { params: { userId: string } }) {
  const [imagePreview1, setImagePreview1] = useState("");
  const [imagePreview2, setImagePreview2] = useState("");
  const [infoUser, setInfoUser] = useState<ScalarDocument[]>();
  const [loadingUploadFront, setLoadingUploadFront] = useState<boolean>(false);
  const [loadingUploadBack, setLoadingUploadBack] = useState<boolean>(false);
  const [numberCc, setNumberCc] = useState<string | null>(null);

  const { user } = useGlobalContext();
  // console.log(user);

  const onDrop1 = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setImagePreview1(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result?.toString().split(",")[1];
      if (base64String) {
        setLoadingUploadFront(true);
        handleSubmitImageFront({ image: base64String });
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const onDrop2 = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setImagePreview2(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result?.toString().split(",")[1];
      if (base64String) {
        setLoadingUploadBack(true);
        handleSubmitImageBack({ image: base64String });
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps: getRootProps1, getInputProps: getInputProps1 } =
    useDropzone({ onDrop: onDrop1 });
  const { getRootProps: getRootProps2, getInputProps: getInputProps2 } =
    useDropzone({ onDrop: onDrop2 });

  const handleSubmitImageFront = async ({ image }: { image: string }) => {
    console.log(user?.token);
    const response = await axios.post(
      "/api/user/docs_update",
      {
        userId: params.userId,
        documentFront: image,
      },
      { headers: { Authorization: `Bearer ${user?.token}` } }
    );

    console.log(response);

    if (response.data.success == true) {
      setLoadingUploadFront(false);
      toast.success("Parte frontal actualizada");
    }
  };

  const handleSubmitImageBack = async ({ image }: { image: string }) => {
    const response = await axios.post(
      "/api/user/docs_update",
      {
        userId: params.userId,
        documentBack: image,
      },
      { headers: { Authorization: `Bearer ${user?.token}` } }
    );

    console.log(response);

    if (response.data.success == true) {
      setLoadingUploadBack(false);
      toast.success("Parte trasera actualizada");
    }
  };

  const handleSubmitNumberCc = async () => {
    const response = await axios.post(
      "/api/user/docs_update",
      {
        userId: params.userId,
        number: numberCc,
      },
      { headers: { Authorization: `Bearer ${user?.token}` } }
    );

    console.log(response);
  };

  useEffect(() => {
    const getInfoUser = async () => {
      const response = await axios.post(
        "/api/user/list_docs",
        {
          userId: params.userId,
        },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      console.log(response.data);
      setInfoUser(response.data.data);
      if (response.data && response.data.data && response.data.data[0]) {
        setImagePreview1(response.data.data[0].documentFront);
        setImagePreview2(response.data.data[0].documentBack);
      }
    };

    getInfoUser();
  }, [params.userId, user?.token]);

  return (
    <>
      <main className={styles.containerPerfil}>
        <CopyText text={params.userId} copy={true} />
        <h1>Identificacion</h1>
        <div className={styles.boxImagePerfil}>
          <div className={styles.boxInfoUserAvatar}>
            <Avatar
              className={styles.avatarIcon}
              src="https://github.com/foultrip.png"
              round={true}
              size={"300"}
            />
          </div>

          <div className={styles.boxInfoUser} {...getRootProps1()}>
            <input {...getInputProps1()} />
            {imagePreview1 ? (
              <>
                <Image
                  className={styles.avatarIcon}
                  src={imagePreview1}
                  alt="img01"
                  width={300}
                  height={300}
                />
                {loadingUploadFront && <p>Cargando</p>}
              </>
            ) : (
              <p className={styles.textPreview}>
                Toma una foto clara de la parte frontal de tu cedula
              </p>
            )}
          </div>

          <div className={styles.boxInfoUser} {...getRootProps2()}>
            <input {...getInputProps2()} />
            {imagePreview2 ? (
              <Image
                className={styles.avatarIcon}
                src={imagePreview2}
                alt="img"
                width={300}
                height={300}
              />
            ) : (
              <p className={styles.textPreview}>
                Toma una foto clara de la parte trasera de tu cedula
              </p>
            )}
          </div>
        </div>

        <h1>Datos Personales</h1>
        <div>
          <p>Cedula de Ciudadania</p>
          <input
            type="text"
            value={
              numberCc !== null
                ? numberCc
                : (infoUser && infoUser[0] && infoUser[0].number) || ""
            }
            onChange={(e) => setNumberCc(e.target.value)}
          />
          <button>Guardar</button>
        </div>
      </main>
    </>
  );
}

export default Profile;