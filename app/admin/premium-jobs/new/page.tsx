"use client";

import { useState, useRef, useImperativeHandle, forwardRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  MapPin,
  Building2,
  Briefcase,
  DollarSign,
  Star,
  Globe,
  Link as LinkIcon,
  Plus,
  X,
  ExternalLink,
  Upload as Linkedin,
  Upload as Github,
  Upload as Twitter,
  Send,
  Loader2,
  ImageIcon,
} from "lucide-react";
import type {
  CreatePremiumJobPayload,
  PremiumJobCompanyMeta,
} from "@/client/adminClient";
import { useCreateAdminPremiumJob } from "@/hooks/useAdmin";
import { useImageUpload } from "@/hooks/useAdmin";
import {
  SectionHeader,
  FieldLabel,
  Input,
  FieldError,
  Textarea,
  PillSelector,
  Select,
} from "@/components/admin/FormComponents";
import {
  BasicsValues,
  StepHandle,
  basicsSchema,
  JOB_TYPES,
  WORK_MODES,
  ExperienceValues,
  experienceSchema,
  EXP_LEVELS,
  SalaryValues,
  salarySchema,
  SALARY_TYPES,
  CURRENCIES,
  SALARY_VISIBILITY_OPTIONS,
  CompanyValues,
  companySchema,
  COMPANY_SIZES,
  INDUSTRIES,
  STEPS,
} from "@/lib/formHelpers";
import {
  JobType,
  WorkMode,
  ExperienceLevel,
  SalaryType,
  SalaryVisibility,
  CompanySize,
  JobStatus,
} from "@/model/userModel";

const BASICS_DEFAULTS: BasicsValues = {
  title: "",
  description: "",
  location: "",
  skills: [],
  job_type: JobType.FullTime,
  work_mode: WorkMode.Remote,
};

const BasicsStep = forwardRef<
  StepHandle,
  { defaultValues: BasicsValues; onValidated: (d: BasicsValues) => void }
>(({ defaultValues, onValidated }, ref) => {
  const [skillInput, setSkillInput] = useState("");

  const form = useForm<BasicsValues>({
    resolver: zodResolver(basicsSchema),
    defaultValues,
    mode: "onTouched",
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    watch,
  } = form;
  const skills = watch("skills");

  const addSkill = () => {
    const t = skillInput.trim();
    if (t && !skills.includes(t))
      setValue("skills", [...skills, t], { shouldValidate: true });
    setSkillInput("");
  };

  useImperativeHandle(ref, () => ({
    submit: () =>
      new Promise((resolve) => {
        handleSubmit(
          (data) => {
            onValidated(data);
            resolve(true);
          },
          () => resolve(false),
        )();
      }),
  }));

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Job basics"
        subtitle="Core information about this role"
      />

      <div>
        <FieldLabel required>Job title</FieldLabel>
        <Input
          {...register("title")}
          placeholder="e.g. Senior Frontend Engineer"
          icon={Briefcase}
          hasError={!!errors.title}
        />
        <FieldError message={errors.title?.message} />
      </div>

      <div>
        <FieldLabel required>Job description</FieldLabel>
        <Textarea
          {...register("description")}
          placeholder="Describe the role, responsibilities, and what makes this opportunity special…"
          rows={6}
          hasError={!!errors.description}
        />
        <FieldError message={errors.description?.message} />
      </div>

      <div>
        <FieldLabel required>Required skills</FieldLabel>
        <div className="flex gap-2 mb-2">
          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder="e.g. React, TypeScript…"
            className="flex-1"
            hasError={!!errors.skills}
          />
          <button
            type="button"
            onClick={addSkill}
            className="h-10 px-4 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Plus size={13} /> Add
          </button>
        </div>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {skills.map((s) => (
              <span
                key={s}
                className="flex items-center gap-1.5 text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2.5 py-1 rounded-full"
              >
                {s}
                <button
                  type="button"
                  onClick={() =>
                    setValue(
                      "skills",
                      skills.filter((x) => x !== s),
                      { shouldValidate: true },
                    )
                  }
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
        <FieldError message={errors.skills?.message} />
      </div>

      <div>
        <FieldLabel required>Location</FieldLabel>
        <Input
          {...register("location")}
          placeholder="e.g. Bengaluru, KA or Remote"
          icon={MapPin}
          hasError={!!errors.location}
        />
        <FieldError message={errors.location?.message} />
      </div>

      <div>
        <FieldLabel>Job type</FieldLabel>
        <Controller
          control={control}
          name="job_type"
          render={({ field }) => (
            <PillSelector
              options={JOB_TYPES}
              value={field.value}
              onChange={field.onChange}
              cols={5}
            />
          )}
        />
      </div>

      <div>
        <FieldLabel>Work mode</FieldLabel>
        <Controller
          control={control}
          name="work_mode"
          render={({ field }) => (
            <PillSelector
              options={WORK_MODES}
              value={field.value}
              onChange={field.onChange}
              cols={3}
            />
          )}
        />
      </div>
    </div>
  );
});
BasicsStep.displayName = "BasicsStep";

// ─── Step 2: Experience ───────────────────────────────────────────────────────

const EXPERIENCE_DEFAULTS: ExperienceValues = {
  experience_level: ExperienceLevel.Fresher,
  experience_min_years: 0,
  experience_max_years: undefined,
  total_openings: 1,
};

const ExperienceStep = forwardRef<
  StepHandle,
  {
    defaultValues: ExperienceValues;
    onValidated: (d: ExperienceValues) => void;
  }
>(({ defaultValues, onValidated }, ref) => {
  const form = useForm<
    z.input<typeof experienceSchema>,
    unknown,
    ExperienceValues
  >({
    resolver: zodResolver(experienceSchema),
    defaultValues,
    mode: "onTouched",
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  useImperativeHandle(ref, () => ({
    submit: () =>
      new Promise((resolve) => {
        handleSubmit(
          (data) => {
            onValidated(data);
            resolve(true);
          },
          () => resolve(false),
        )();
      }),
  }));

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Experience & openings"
        subtitle="Who you're looking for"
      />

      <div>
        <FieldLabel>Experience level</FieldLabel>
        <Controller
          control={control}
          name="experience_level"
          render={({ field }) => (
            <PillSelector
              options={EXP_LEVELS}
              value={field.value}
              onChange={field.onChange}
              cols={6}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <FieldLabel required>Min years</FieldLabel>
          <Input
            type="number"
            min={0}
            {...register("experience_min_years")}
            placeholder="0"
            hasError={!!errors.experience_min_years}
          />
          <FieldError message={errors.experience_min_years?.message} />
        </div>
        <div>
          <FieldLabel>Max years</FieldLabel>
          <Input
            type="number"
            min={0}
            {...register("experience_max_years")}
            placeholder="5"
            hasError={!!errors.experience_max_years}
          />
          <FieldError message={errors.experience_max_years?.message} />
        </div>
        <div>
          <FieldLabel required>Openings</FieldLabel>
          <Input
            type="number"
            min={1}
            {...register("total_openings")}
            placeholder="1"
            hasError={!!errors.total_openings}
          />
          <FieldError message={errors.total_openings?.message} />
        </div>
      </div>
    </div>
  );
});
ExperienceStep.displayName = "ExperienceStep";

// ─── Step 3: Salary ───────────────────────────────────────────────────────────

const SALARY_DEFAULTS: SalaryValues = {
  salary_type: SalaryType.Annual,
  salary_currency: "INR",
  salary_min: 0,
  salary_max: 0,
  salary_visibility: SalaryVisibility.Show,
};

const SalaryStep = forwardRef<
  StepHandle,
  { defaultValues: SalaryValues; onValidated: (d: SalaryValues) => void }
>(({ defaultValues, onValidated }, ref) => {
  const form = useForm<z.input<typeof salarySchema>, unknown, SalaryValues>({
    resolver: zodResolver(salarySchema),
    defaultValues,
    mode: "onTouched",
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  useImperativeHandle(ref, () => ({
    submit: () =>
      new Promise((resolve) => {
        handleSubmit(
          (data) => {
            onValidated(data);
            resolve(true);
          },
          () => resolve(false),
        )();
      }),
  }));

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Salary & compensation"
        subtitle="Transparent salaries get 3× more applicants"
      />

      <div>
        <FieldLabel>Salary type</FieldLabel>
        <Controller
          control={control}
          name="salary_type"
          render={({ field }) => (
            <PillSelector
              options={SALARY_TYPES}
              value={field.value}
              onChange={field.onChange}
              cols={4}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <FieldLabel>Currency</FieldLabel>
          <Select {...register("salary_currency")}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <FieldLabel required>Min salary</FieldLabel>
          <Input
            type="number"
            min={0}
            {...register("salary_min")}
            placeholder="500000"
            icon={DollarSign}
            hasError={!!errors.salary_min}
          />
          <FieldError message={errors.salary_min?.message} />
        </div>
        <div>
          <FieldLabel required>Max salary</FieldLabel>
          <Input
            type="number"
            min={0}
            {...register("salary_max")}
            placeholder="1500000"
            icon={DollarSign}
            hasError={!!errors.salary_max}
          />
          <FieldError message={errors.salary_max?.message} />
        </div>
      </div>

      <div>
        <FieldLabel>Salary visibility</FieldLabel>
        <Controller
          control={control}
          name="salary_visibility"
          render={({ field }) => (
            <PillSelector
              options={SALARY_VISIBILITY_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              cols={3}
            />
          )}
        />
      </div>
    </div>
  );
});
SalaryStep.displayName = "SalaryStep";

// ─── Step 4: Company ──────────────────────────────────────────────────────────

const COMPANY_DEFAULTS: CompanyValues = {
  name: "",
  size: CompanySize.Micro,
  location: "",
  website: "",
  bio: "",
  industries: [],
  social_links: { linkedin: "", github: "", twitter: "", portfolio: "" },
  external_apply_url: "",
  application_deadline: "",
};

const CompanyStep = forwardRef<
  StepHandle,
  {
    defaultValues: CompanyValues;
    onValidated: (d: CompanyValues) => void;
    logoFile: File | null;
    logoPreview: string | null;
    onLogoChange: (file: File) => void;
  }
>(
  (
    { defaultValues, onValidated, logoFile, logoPreview, onLogoChange },
    ref,
  ) => {
    const [industryInput, setIndustryInput] = useState("");
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const form = useForm<CompanyValues>({
      resolver: zodResolver(companySchema),
      defaultValues,
      mode: "onTouched",
    });

    const {
      register,
      control,
      handleSubmit,
      formState: { errors },
      watch,
      setValue,
    } = form;
    const industries = watch("industries");

    const handleFileSelect = (f: File) => {
      if (f.type.startsWith("image/")) onLogoChange(f);
    };

    const addIndustry = (val: string) => {
      const t = val.trim();
      if (t && !industries.includes(t))
        setValue("industries", [...industries, t]);
      setIndustryInput("");
    };

    useImperativeHandle(ref, () => ({
      submit: () =>
        new Promise((resolve) => {
          handleSubmit(
            (data) => {
              onValidated(data);
              resolve(true);
            },
            () => resolve(false),
          )();
        }),
    }));

    return (
      <div className="space-y-5">
        <SectionHeader
          title="Company snapshot"
          subtitle="Embedded company profile shown on the premium job listing"
        />

        {/* Company name */}
        <div>
          <FieldLabel required>Company name</FieldLabel>
          <Input
            {...register("name")}
            placeholder="e.g. Acme Inc."
            icon={Building2}
            hasError={!!errors.name}
          />
          <FieldError message={errors.name?.message} />
        </div>

        {/* Logo upload */}
        <div>
          <FieldLabel>
            Company logo{" "}
            <span className="text-gray-600 font-normal normal-case tracking-normal">
              (recommended 400×400)
            </span>
          </FieldLabel>

          {!logoPreview ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files[0];
                if (f) handleFileSelect(f);
              }}
              onClick={() => fileRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-8 cursor-pointer transition-all ${
                dragOver
                  ? "border-violet-500 bg-violet-500/10"
                  : "border-gray-700 bg-gray-800/60 hover:border-violet-500/50 hover:bg-violet-500/5"
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f);
                }}
              />
              <div className="w-11 h-11 rounded-xl bg-violet-500/15 flex items-center justify-center">
                <ImageIcon size={20} className="text-violet-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-300">
                  Drag & drop or click to upload
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  PNG · JPG · SVG — Max 2MB
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 rounded-xl border border-violet-500/25 bg-violet-500/5">
              <div className="w-14 h-14 rounded-xl border border-gray-700 bg-gray-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-200">
                  Logo ready to upload
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {logoFile
                    ? `${(logoFile.size / 1024).toFixed(0)} KB · ${logoFile.type.split("/")[1].toUpperCase()}`
                    : "Looking great!"}
                </p>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="text-xs text-violet-400 hover:underline mt-1 transition-colors"
                >
                  Change logo
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelect(f);
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Size + HQ */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Company size</FieldLabel>
            <Controller
              control={control}
              name="size"
              render={({ field }) => (
                <PillSelector
                  options={COMPANY_SIZES}
                  value={field.value}
                  onChange={field.onChange}
                  cols={3}
                />
              )}
            />
          </div>
          <div>
            <FieldLabel>Headquarters</FieldLabel>
            <Input
              {...register("location")}
              placeholder="e.g. San Francisco, CA"
              icon={MapPin}
              hasError={!!errors.location}
            />
            <FieldError message={errors.location?.message} />
          </div>
        </div>

        {/* Website */}
        <div>
          <FieldLabel>Company website</FieldLabel>
          <Input
            {...register("website")}
            placeholder="https://acmeinc.com"
            icon={Globe}
            hasError={!!errors.website}
          />
          <FieldError message={errors.website?.message} />
        </div>

        {/* External apply URL */}
        <div>
          <FieldLabel required>External apply URL</FieldLabel>
          <Input
            {...register("external_apply_url")}
            placeholder="https://yourcompany.com/careers/role"
            icon={LinkIcon}
            hasError={!!errors.external_apply_url}
          />
          <FieldError message={errors.external_apply_url?.message} />
        </div>

        {/* Application deadline */}
        <div>
          <FieldLabel>Application deadline</FieldLabel>
          <Input
            type="date"
            {...register("application_deadline")}
            className="w-56"
          />
        </div>

        {/* Bio */}
        <div>
          <FieldLabel>Company bio</FieldLabel>
          <Textarea
            {...register("bio")}
            placeholder="What does your company do? What's your mission and culture?"
            rows={4}
          />
        </div>

        {/* Industries */}
        <div>
          <FieldLabel>Industries</FieldLabel>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind}
                type="button"
                onClick={() => {
                  if (industries.includes(ind))
                    setValue(
                      "industries",
                      industries.filter((x) => x !== ind),
                    );
                  else setValue("industries", [...industries, ind]);
                }}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all
                ${
                  industries.includes(ind)
                    ? "bg-violet-500/15 text-violet-400 border-violet-500/30"
                    : "bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-600 hover:text-gray-300"
                }`}
              >
                {ind}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={industryInput}
              onChange={(e) => setIndustryInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addIndustry(industryInput);
                }
              }}
              placeholder="Custom industry…"
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => addIndustry(industryInput)}
              className="h-10 px-3 bg-gray-800 border border-gray-700 text-gray-400 hover:text-violet-400 hover:border-violet-500/40 rounded-xl transition-all"
            >
              <Plus size={13} />
            </button>
          </div>
          {industries.filter((i) => !INDUSTRIES.includes(i)).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {industries
                .filter((i) => !INDUSTRIES.includes(i))
                .map((i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2.5 py-1 rounded-full"
                  >
                    {i}
                    <button
                      type="button"
                      onClick={() =>
                        setValue(
                          "industries",
                          industries.filter((x) => x !== i),
                        )
                      }
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
            </div>
          )}
        </div>

        {/* Social links */}
        <div className="p-4 bg-gray-800/60 rounded-xl border border-gray-700/50 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Social links
          </p>
          {(
            [
              {
                key: "linkedin" as const,
                icon: Linkedin,
                placeholder: "https://linkedin.com/company/acme",
              },
              {
                key: "github" as const,
                icon: Github,
                placeholder: "https://github.com/acme",
              },
              {
                key: "twitter" as const,
                icon: Twitter,
                placeholder: "https://twitter.com/acme",
              },
              {
                key: "portfolio" as const,
                icon: ExternalLink,
                placeholder: "https://acme.dev",
              },
            ] as const
          ).map(({ key, icon: Icon, placeholder }) => (
            <div key={key} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0">
                <Icon size={13} className="text-gray-400" />
              </div>
              <div className="flex-1">
                <Input
                  {...register(`social_links.${key}`)}
                  placeholder={placeholder}
                  hasError={!!errors.social_links?.[key]}
                />
                <FieldError message={errors.social_links?.[key]?.message} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
);
CompanyStep.displayName = "CompanyStep";

// ─── Sidebar stepper ──────────────────────────────────────────────────────────

function Stepper({ currentIdx }: { currentIdx: number }) {
  return (
    <div className="space-y-1">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div
            key={step.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
              ${active ? "bg-violet-600 shadow-lg shadow-violet-500/30" : done ? "bg-violet-500/20" : "bg-gray-800"}`}
            >
              {done ? (
                <Check size={13} className="text-violet-400" />
              ) : (
                <Icon
                  size={13}
                  className={active ? "text-white" : "text-gray-600"}
                />
              )}
            </div>
            <p
              className={`text-xs font-semibold ${active ? "text-white" : done ? "text-gray-400" : "text-gray-600"}`}
            >
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ─── Build payload ────────────────────────────────────────────────────────────

function buildPayload(
  basics: BasicsValues,
  experience: ExperienceValues,
  salary: SalaryValues,
  company: CompanyValues,
  logoUrl?: string,
): CreatePremiumJobPayload {
  const company_meta: PremiumJobCompanyMeta = {
    name: company.name,
    ...(logoUrl && { logo_url: logoUrl }),
    size: company.size,
    industry: company.industries,
    ...(company.location && { location: company.location }),
    ...(company.website && { website: company.website }),
    ...(company.bio && { bio: company.bio }),
    social_links: Object.fromEntries(
      Object.entries(company.social_links).filter(([, v]) => Boolean(v)),
    ) as PremiumJobCompanyMeta["social_links"],
  };

  return {
    title: basics.title,
    description: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: basics.description }],
        },
      ],
    },
    location: basics.location,
    job_type: basics.job_type,
    work_mode: basics.work_mode,
    experience_level: experience.experience_level,
    experience_min_years: experience.experience_min_years,
    ...(experience.experience_max_years !== undefined && {
      experience_max_years: experience.experience_max_years,
    }),
    salary_min: salary.salary_min,
    salary_max: salary.salary_max,
    salary_currency: salary.salary_currency,
    salary_type: salary.salary_type,
    salary_visibility: salary.salary_visibility,
    skills: basics.skills,
    total_openings: experience.total_openings,
    form_type: 1,
    external_apply_url: company.external_apply_url,
    is_urgent: false,
    is_featured: false,
    referral_status: 1,
    ...(company.application_deadline && {
      application_deadline: company.application_deadline,
    }),
    status: JobStatus.Active,
    company_meta,
  };
}

// ─── Main form ────────────────────────────────────────────────────────────────

interface AdminPremiumJobFormProps {
  onSubmit?: (payload: CreatePremiumJobPayload) => Promise<void>;
}

export default function AdminPremiumJobForm({
  onSubmit,
}: AdminPremiumJobFormProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // Accumulated validated data per step
  const [basicsData, setBasicsData] = useState<BasicsValues>(BASICS_DEFAULTS);
  const [experienceData, setExperienceData] =
    useState<ExperienceValues>(EXPERIENCE_DEFAULTS);
  const [salaryData, setSalaryData] = useState<SalaryValues>(SALARY_DEFAULTS);
  const [companyData, setCompanyData] =
    useState<CompanyValues>(COMPANY_DEFAULTS);

  // ── FIX: mirror of companyData as a ref so handleSubmit can read the
  //         freshly-validated value in the same tick it was written,
  //         without waiting for React to re-render and flush the state update.
  const latestCompanyData = useRef<CompanyValues>(COMPANY_DEFAULTS);

  // Logo
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const createJob = useCreateAdminPremiumJob();
  const { mutateAsync: uploadImage, isPending: isUploading } = useImageUpload();

  // Refs to each step's imperative handle
  const basicsRef = useRef<StepHandle>(null);
  const experienceRef = useRef<StepHandle>(null);
  const salaryRef = useRef<StepHandle>(null);
  const companyRef = useRef<StepHandle>(null);

  const stepRefs = [basicsRef, experienceRef, salaryRef, companyRef];
  const currentStep = STEPS[stepIdx];

  const handleLogoChange = (file: File) => {
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const goNext = async () => {
    const currentRef = stepRefs[stepIdx];
    const valid = await currentRef.current?.submit();
    if (!valid) return;
    setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setStepIdx((i) => Math.max(0, i - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    const currentRef = stepRefs[stepIdx];
    const valid = await currentRef.current?.submit();
    if (!valid) return;

    let logoUrl: string | undefined;
    if (logoFile) {
      logoUrl = await uploadImage({ file: logoFile, userId: "admin" });
    }

    // ── FIX: use the ref instead of companyData state — the ref was written
    //         synchronously inside onValidated before this line runs, whereas
    //         the state update from setCompanyData hasn't re-rendered yet.
    const payload = buildPayload(
      basicsData,
      experienceData,
      salaryData,
      latestCompanyData.current,
      logoUrl,
    );

    if (onSubmit) {
      await onSubmit(payload);
      setSubmitted(true);
    } else {
      createJob.mutate(payload, { onSuccess: () => setSubmitted(true) });
    }
  };

  const isSubmitting = createJob.isPending || isUploading;

  const resetForm = () => {
    setSubmitted(false);
    setStepIdx(0);
    setBasicsData(BASICS_DEFAULTS);
    setExperienceData(EXPERIENCE_DEFAULTS);
    setSalaryData(SALARY_DEFAULTS);
    setCompanyData(COMPANY_DEFAULTS);
    latestCompanyData.current = COMPANY_DEFAULTS;
    setLogoFile(null);
    setLogoPreview(null);
  };

  if (submitted) {
    return (
      <div className="flex h-screen bg-gray-950 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-violet-400" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">
            Premium job published!
          </h2>
          <p className="text-sm text-gray-500">
            The job is now live on the platform.
          </p>
          <button
            onClick={resetForm}
            className="mt-6 h-9 px-5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Post another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-screen bg-gray-950 overflow-hidden"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-gray-900 border-r border-gray-800 px-4 py-6 flex-shrink-0">
        <div className="flex items-center gap-2 mb-8 px-3">
          <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center">
            <Star size={14} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Premium Jobs</p>
            <p className="text-xs text-gray-500">Admin only</p>
          </div>
        </div>
        <Stepper currentIdx={stepIdx} />
        <div className="mt-auto px-3">
          <div className="p-3 bg-violet-500/5 border border-violet-500/15 rounded-xl">
            <p className="text-xs text-violet-400 font-medium mb-1">
              Premium listing
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              This job will include an embedded company snapshot visible to all
              candidates.
            </p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-4 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white">
                Post premium job
              </h1>
              <span className="text-xs bg-violet-500/15 text-violet-400 border border-violet-500/25 px-2 py-0.5 rounded-full font-medium">
                Admin only
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Step {stepIdx + 1} of {STEPS.length} — {currentStep.label}
            </p>
          </div>
          <div className="lg:hidden flex items-center gap-1.5 ml-auto">
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                className={`w-2 h-2 rounded-full transition-all
                ${i === stepIdx ? "bg-violet-500 w-4" : i < stepIdx ? "bg-violet-500/40" : "bg-gray-700"}`}
              />
            ))}
          </div>
          <div className="hidden lg:block flex-1 ml-4">
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-600 rounded-full transition-all duration-500"
                style={{ width: `${((stepIdx + 1) / STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Body — all steps rendered but only current is visible to preserve RHF state */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-2xl mx-auto px-6 py-8">
            <div className={stepIdx === 0 ? "block" : "hidden"}>
              <BasicsStep
                ref={basicsRef}
                defaultValues={basicsData}
                onValidated={setBasicsData}
              />
            </div>
            <div className={stepIdx === 1 ? "block" : "hidden"}>
              <ExperienceStep
                ref={experienceRef}
                defaultValues={experienceData}
                onValidated={setExperienceData}
              />
            </div>
            <div className={stepIdx === 2 ? "block" : "hidden"}>
              <SalaryStep
                ref={salaryRef}
                defaultValues={salaryData}
                onValidated={setSalaryData}
              />
            </div>
            <div className={stepIdx === 3 ? "block" : "hidden"}>
              <CompanyStep
                ref={companyRef}
                defaultValues={companyData}
                onValidated={(d) => {
                  // ── FIX: write to ref synchronously, then also update state
                  //         so defaultValues stays correct if the step re-mounts.
                  latestCompanyData.current = d;
                  setCompanyData(d);
                }}
                logoFile={logoFile}
                logoPreview={logoPreview}
                onLogoChange={handleLogoChange}
              />
            </div>
          </div>
        </div>

        {/* Footer nav */}
        <div className="bg-gray-900 border-t border-gray-800 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <button
            onClick={goBack}
            disabled={stepIdx === 0}
            className="h-9 px-4 rounded-xl border border-gray-700 text-sm text-gray-400 hover:text-white hover:bg-gray-800
              disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div className="flex items-center gap-2">
            {stepIdx < STEPS.length - 1 ? (
              <button
                onClick={goNext}
                className="h-9 px-5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold
                  flex items-center gap-2 transition-colors shadow-lg shadow-violet-500/20"
              >
                Continue <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-9 px-5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold
                  flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Uploading
                    logo…
                  </>
                ) : isSubmitting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Publishing…
                  </>
                ) : (
                  <>
                    <Send size={13} /> Publish job
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
